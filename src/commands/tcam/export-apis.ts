/**
 * Copyright 2022. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */
import { flags } from '@oclif/command'
import { chalk, TCBaseCommand, ux } from '@tibco-software/cic-cli-core';
import { join } from 'path';
import { homedir } from 'os';
import * as AdmZip from 'adm-zip';
import { writeFileSync } from 'fs';
const YAML = require('json-to-pretty-yaml');
import { CLIAPIS } from '../../constants/url.constants';
export default class TcamExportApis extends TCBaseCommand {
  static description = 'Exports APIs to local file system';
  static examples: string[] | undefined = ["tibco tcam:export-apis -p 'Cli Project'", "tibco tcam:export-apis -p 'Cli Project' -a 'InvalidApi,CliOpenApi' -y"];
  spinner: any;
  zip: any;
  static flags: flags.Input<any> & typeof TCBaseCommand.flags = {
    ...TCBaseCommand.flags,
    help: flags.help({ char: 'h' }),
    projectname: flags.string({ char: 'p', required: true, description: 'Exports the APIs of the specified project' }),
    apinames: flags.string({ char: 'a', description: 'Specify the API names that need to be exported' }),
    yaml: flags.boolean({ char: 'y', description: 'Exports APIs in yaml format' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
  }
  async init() {
    await super.init();
    // Do any other  initialization
    this.zip = new AdmZip();
    this.spinner = await ux.spinner();
  }

  async run() {
    const { flags } = this.parse(TcamExportApis);
    let tcReq = this.getTCRequest();
    this.spinner.start("Exporting APIs...");
    const exportExtension = flags.yaml ? '.yaml' : '.json';
    let inputApiNames: any[] = [];
    const projRes: any = await tcReq.doRequest(CLIAPIS.getprojects, { method: 'GET' });

    const projects: any[] = projRes.body.projects;
    const project = projects.find((proj) => proj.projectName.toLowerCase() === flags.projectname.trim().toLowerCase());
    if (!project) {
      throw { message: `No project with name ${chalk.red.bold(flags.projectname)} exists.` }
    }
    let payload: any = { projectId: project.SK }
    if (flags.apinames) {
      inputApiNames = flags.apinames.split(',').map((name: any) => name.trim());
      payload['apiNames'] = inputApiNames;
    }
    const apiRes: any = await tcReq.doRequest(CLIAPIS.exportapis, { method: 'POST' }, payload);
    let filteredApis: any[] = apiRes.body.apiItems;
    let invalidNames = [];
    if (filteredApis.length < inputApiNames.length) {
      const filteredApiNames = filteredApis.map(api => api.apiName);
      for (const inputName of inputApiNames) {
        if (!filteredApiNames.includes(inputName)) {
          invalidNames.push(inputName);
        }
      }
    }
    if (filteredApis.length === 0) {
      throw { message: `No APIs found` }
    }
    if (filteredApis.length > 1) {
      if (exportExtension === '.json') {
        for (const api of filteredApis) {
          this.zip.addFile(api.apiName + '-' + api.version + '.json', Buffer.from(JSON.stringify(api.content, undefined, 4)));
        }
      } else {
        for (const api of filteredApis) {
          this.zip.addFile(api.apiName + '-' + api.version + '.yaml', Buffer.from(YAML.stringify(api.content)));
        }
      }
      this.zip.writeZip(join(homedir(), 'Downloads', `${project.projectName}.zip`));
    }
    if (filteredApis.length === 1) {
      const api = filteredApis[0];
      if (exportExtension === '.json') {
        writeFileSync(join(homedir(), 'Downloads', api.apiName + '-' + api.version + '.json'), JSON.stringify(api.content, undefined, 4));
      } else {
        writeFileSync(join(homedir(), 'Downloads', api.apiName + '-' + api.version + '.yaml'), YAML.stringify(api.content));
      }
    }
    if (filteredApis.length > 0) {
      this.spinner.succeed(`${filteredApis.length} API(s) successfully exported to the Downloads folder`);
    }
    if (inputApiNames.length > 0 && inputApiNames.length === invalidNames.length) {
      this.spinner.fail();
    }
    if (invalidNames.length > 0) {
      this.error(`${invalidNames.length} API(s) export failed`, { exit: false });
      for (const apiName of invalidNames) {
        this.error(`${chalk.red.bold(apiName)} does not exist in ${chalk.green.bold(flags.projectname)} project`, { exit: false });
      }
    }
  }
  async catch(err: Error) {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    if (this.spinner)
      this.spinner.fail();
    return super.catch(err);
  }
  async finally(err: Error) {
    // called after run and catch regardless of whether or not the command errored
    return super.finally(err);
  }
}
