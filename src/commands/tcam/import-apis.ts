/**
 * Copyright 2022. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */
import { flags } from '@oclif/command';
import { TCBaseCommand, ux } from '@tibco-software/cic-cli-core';
import { ImportApi } from '../../utils/constants';
import * as fs from 'fs';
import { join } from 'path';
import { chalk } from '@tibco-software/cic-cli-core';
import { CLIAPIS } from '../../utils/url.constants';
import { promises as fsPromises, lstatSync } from 'fs';
import { extensionChecker, processApi } from '../../utils/common.functions';
export default class TcamImportApis extends TCBaseCommand {
  static description = 'Import API specs';
  static examples: string[] | undefined = [
    "tibco tcam:import-apis --from 'C:/Users/myuser/Desktop/Upload/ImportApi.json' --projectname 'TestProject'",
    "tibco tcam:import-apis -f 'C:/Users/myuser/Desktop/Upload/ImportProject' -p 'TestProject'"
  ];
  spinner: any;
  static flags: flags.Input<any> & typeof TCBaseCommand.flags = {
    ...TCBaseCommand.flags,
    help: flags.help({ char: 'h' }),
    projectname: flags.string({
      char: 'p',
      description: 'Specify the target project name for the API import. The project must exist in the organization.', required: true
    }),
    from: flags.string({
      char: 'f',
      description: 'Specify the location of an API spec or directory',
      required: true,
    }),
    newproject: flags.string({
      char: "n",
      description: "Specify to create new project if it doesn't exist in the organization",
      helpValue: 'yes',
    })
  }
  async init() {
    await super.init();
    // Do any other  initialization
    this.spinner = await ux.spinner();
  }
  async run() {
    const { flags } = this.parse(TcamImportApis);
    const path = flags.from.trim();
    const apiArr: ImportApi[] = [];
    let tcReq = this.getTCRequest();
    this.spinner.start("Importing APIs...");
    const projRes: any = await tcReq.doRequest(CLIAPIS.getprojects, { method: 'GET' });
    const projects: any[] = projRes.body.projects;
    const inputProjName: string = flags.projectname.trim();
    let project = projects.find((proj) => proj.projectName.toLowerCase() === inputProjName.toLowerCase());
    if (!project) {
      this.spinner.stop();
      const ans: string = await ux.prompt(`Project, [${chalk.red.bold(flags.projectname)}] doesn't exist. Do you wish to create the project? (Y/N)`,'input',flags.newproject);    
      if (ans.toLowerCase() === 'y' || ans.toLowerCase() === 'yes') {
        const projRes: any = await tcReq.doRequest(CLIAPIS.createproject, { method: 'POST' }, { projectName: inputProjName });
        this.spinner.succeed('Project created successfully.');
        this.spinner.start("Importing APIs...");
        project = projRes.body.project;
      } else {
        this.exit();
      }
    }
    if (lstatSync(path).isFile()) {// Path is a file
      const fileDetails = extensionChecker(path);
      const fileData = fs.readFileSync(path, 'utf-8');
      processApi(fileDetails, fileData, apiArr, inputProjName);
    }
    else { //Path is a directory
      const files = await fsPromises.readdir(path);
      for (const file of files) {
        const fpath = join(path, file);
        const fileDetails = extensionChecker(fpath);
        const fileData = await fsPromises.readFile(fpath, { encoding: 'utf8' });
        processApi(fileDetails, fileData, apiArr, inputProjName);
      }
    }
    const payload = { apiList: apiArr };
    const res: any = await tcReq.doRequest(CLIAPIS.importapis, { method: 'POST' }, payload);
    if (res.body.invalidApis.length === 0) {
      this.spinner.succeed(`${apiArr.length} ${apiArr.length === 1 ? 'API':'APIs'} imported successfully.`);
    }
    else if (res.body.invalidApis.length > 0) {
      if (res.body.invalidApis.length < apiArr.length) {
        const successCount = apiArr.length - res.body.invalidApis.length;
        this.spinner.succeed(`${successCount} ${successCount === 1 ? 'API':'APIs'} imported sucessfully.`);
      } else {
        this.spinner.fail();
      }
      const failCount = res.body.invalidApis.length;
      this.error(`Import of ${chalk.red.bold(failCount)} ${failCount === 1 ? 'API':'APIs'} failed.`, { exit: false });
      for (const invalidApi of res.body.invalidApis) {
        if (invalidApi.errorMsg === 'API with same name & version already exist') {
          this.error(`An API named ${chalk.red.bold(invalidApi.fileName)} already exists. Try renaming your file.`, { exit: false });
        } else {
          this.error(`API Spec ${chalk.red.bold(invalidApi.fileName)} contains invalid content.
     Try tcam:validate-apis to know the validation errors.`, { exit: false });
        }
      }
    }

  }
  async catch(err: any) {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    if (this.spinner)
      this.spinner.fail();
    if (err?.httpResponse?.message)
      err = { message: err?.httpResponse?.message }
    return super.catch(err);
  }
  async finally(err: Error) {
    // called after run and catch regardless of whether or not the command errored
    return super.finally(err);
  }
}
