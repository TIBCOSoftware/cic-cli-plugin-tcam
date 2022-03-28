/**
 * Copyright 2022. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */
import { flags } from '@oclif/command';
import { TCBaseCommand, ux } from '@tibco-software/cic-cli-core';
import { ImportApi } from '../../constants/constants';
import * as fs from 'fs';
import { extname, basename, join } from 'path';
import { load } from 'js-yaml';
import { chalk } from '@tibco-software/cic-cli-core';
import { CLIAPIS } from '../../constants/url.constants';
export default class TcamImportApis extends TCBaseCommand {
  static description = 'Imports API specs';
  static examples: string[] | undefined = [
    "tibco tcam:import-apis -l 'C:/Users/myuser/Desktop/Upload/ImportApi.json' -p 'TestProject'",
    "tibco tcam:import-apis -l 'C:/Users/myuser/Desktop/Upload/ImportProject' -p 'TestProject'"
  ];
  spinner: any;
  static flags: flags.Input<any> & typeof TCBaseCommand.flags = {
    ...TCBaseCommand.flags,
    help: flags.help({ char: 'h' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
    projectname: flags.string({
      char: 'p',
      description: 'Specify the project name to which the API spec needs to be imported. The project must exist in the organization.', required: true
    }),
    location: flags.string({
      char: 'l',
      description: 'Specify the location or path of an API spec or a directory containing one or more API specs that need to be imported to a Project',
      required: true,
    })
  }
  async init() {
    await super.init();
    // Do any other  initialization
    this.spinner = await ux.spinner();
  }
  async run() {
    const { flags } = this.parse(TcamImportApis);
    const path = flags.location.trim();
    const apiArr: ImportApi[] = [];
    let tcReq = this.getTCRequest();
    this.spinner.start("Importing APIs...");
    const projRes: any = await tcReq.doRequest(CLIAPIS.getprojects, {method: 'GET'});
    const projects: any[] = projRes.body.projects;
     let project = projects.find((proj) => proj.projectName.toLowerCase() === flags.projectname.trim().toLowerCase());
    if (!project) {
      this.spinner.stop();
      const ans:string =  await ux.prompt(`Project, ${chalk.red.bold(flags.projectname)} doesn't exist. Do you wish to create the project? (Y/N)`);
      if(ans.toLowerCase() === 'y' || ans.toLowerCase() === 'yes'){
        const projRes:any = await tcReq.doRequest(CLIAPIS.createproject,{method:'POST'},{projectName:flags.projectname});
        this.spinner.succeed('Project created successfully!');
        this.spinner.start("Importing APIs...");
        project = projRes.body.project;
      }else{
        this.exit();
      }
    }
 //   this.spinner.start("Importing APIs...");
    if (fs.lstatSync(path).isFile()) {// Path is a file
      const fileDetails = this.extensionChecker(path);
      const fileData = fs.readFileSync(path, 'utf-8');
      const api = fileDetails.extension === '.json' ? JSON.parse(fileData) : load(fileData);
      const fileStringData = fileDetails.extension === '.json' ? fileData : JSON.stringify(api);
      this.readApi(api, apiArr, project, fileDetails.name, fileStringData,fileDetails.extension);
    }
    else { //Path is a directory
      const files = await this.readDir(path);
      for (const file of files) {
        const fpath = join(path, file);
        const fileDetails = this.extensionChecker(fpath);
        const fileData = await this.readFileAsync(fpath, fileDetails.name);
        const api = fileDetails.extension === '.json' ? JSON.parse(fileData) : load(fileData);
        const fileStringData = fileDetails.extension === '.json' ? fileData : JSON.stringify(api);
        this.readApi(api, apiArr, project, fileDetails.name, fileStringData,fileDetails.extension);
      }
    }
    const payload = { apiList: apiArr };
    const res: any = await tcReq.doRequest(CLIAPIS.importapis, {method: 'POST'}, payload);
    if (res.body.invalidApis.length === 0) {
      this.spinner.succeed(`${apiArr.length} API(s) Imported successfully!`);
    }
    else if (res.body.invalidApis.length > 0) {
      if (res.body.invalidApis.length < apiArr.length) {
        this.spinner.succeed(`${apiArr.length - res.body.invalidApis.length} API(s) Imported sucessfully!`);
      } else {
        this.spinner.fail();
      }
      this.error(`Import of ${chalk.red.bold(res.body.invalidApis.length)} API(s) failed.`, { exit: false });
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
  public extensionChecker = (path: string): any => {
    const name = basename(path);
    const ext = extname(path);
    const fileName = basename(name, ext);
    if (ext !== '.json' && ext !== '.yml' && ext !== '.yaml') {
      throw { message: `${chalk.red.bold(fileName)} file is not of type json or yaml` }
    }
    return { name: fileName, extension: ext };
  }
  public keyExist = (obj:any,key:string): boolean => {
     return Object.prototype.hasOwnProperty.call(obj,key);
  }
  public readApi = (api: any, apiArr: ImportApi[], project: any, fileName: string, fileData: any,ext:string): void => {
    if (!this.keyExist(api,'openapi') && !this.keyExist(api,'asyncapi') && !this.keyExist(api,'swagger')) {
      throw { message: `${chalk.red.bold(fileName)} file is not an open or async api` }
    }
    const importApi: ImportApi = {}
    if (this.keyExist(api,'asyncapi')) {
      importApi.apiSpecType = 'asyncapi';
      importApi.schemaType = 'A2S2.0';
    }
    else if (this.keyExist(api,'openapi') || this.keyExist(api,'swagger')) {
      importApi.apiSpecType = 'openapi';
      importApi.schemaType = this.keyExist(api,'openapi') ? 'OAS3.0' : 'OAS2.0';
    }
    ext === '.json' ? importApi.apiContentType = 'json' : importApi.apiContentType = 'yaml';
    importApi.apiName = fileName;
    importApi.content = fileData;
    importApi.apiVersion = api.info.version ? api.info.version : '1.0';
    importApi.projectId = project.SK;
    apiArr.push(importApi);
  }
  public readDir = async (dirPath: string): Promise<any> => {
    return new Promise((res, rej) => {
      fs.readdir(dirPath, { encoding: 'utf8' }, (err, files) => {
        if (err) {
          rej({ message: `Error occured while reading directory` });
        }
        res(files);
      })
    })
  }
  public readFileAsync = async (filepath: string, fileName: string): Promise<any> => {
    return new Promise((res, rej) => {
      fs.readFile(filepath, { encoding: 'utf8' }, (err, data) => {
        if (err) {
          rej({ message: `Error occured while reading file ${fileName}` });
        }
        res(data);
      })
    })
  }
  async catch(err: any) {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    if (this.spinner)
      this.spinner.fail();
    if(err?.httpResponse?.message)
    err = {message: err?.httpResponse?.message }
    return super.catch(err);
  }
  async finally(err: Error) {
    // called after run and catch regardless of whether or not the command errored
    return super.finally(err);
  }
}
