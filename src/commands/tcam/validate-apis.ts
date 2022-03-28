/**
 * Copyright 2022. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */
import {flags} from '@oclif/command'
import {chalk,TCBaseCommand,ux} from '@tibco-software/cic-cli-core';
import { basename, extname, join } from 'path';
import { load } from 'js-yaml';
import * as fs from 'fs';
import { ImportApi } from '../../constants/constants';
import { CLIAPIS } from '../../constants/url.constants';
export default class TcamValidateApis extends TCBaseCommand {
  static description = 'Validate API specs';
  static examples: string[] | undefined = [
      "tibco tcam:validate-apis -l 'C:/Users/myuser/Desktop/Upload/ImportApi.json'",
      "tibco tcam:validate-apis -l 'C:/Users/myuser/Desktop/Upload/ImportProject'",
      "tibco tcam:validate-apis -l 'C:/Users/myuser/Desktop/Upload/ImportProject -a 'bankapi,yamlapi'"
  ];
  spinner: any;
  static flags: flags.Input<any> & typeof TCBaseCommand.flags = {
      ...TCBaseCommand.flags,
      help: flags.help({ char: 'h' }),
      // flag with no value (-f, --force)
      force: flags.boolean({ char: 'f' }),
      location: flags.string({
          char: 'l',
          description: 'Specify the location or path of an API spec or a directory containing one or more API specs',
          required: true,
      }),
      apinames: flags.string({char: 'a', description: 'API names that need to be validated from the directory'})
  }
  async init() {
      await super.init();
      // Do any other  initialization
      this.spinner = await ux.spinner();
  }
  async run() {
      const { flags } = this.parse(TcamValidateApis);
      const path = flags.location.trim();
      const apiArr: ImportApi[] = [];
      let inputApis: any[] = [];
      let tcReq = this.getTCRequest();
      this.spinner.start("Validating APIs...");
      if(flags.apinames){
        inputApis = flags.apinames.split(',').map((name:any) => name.trim());
        if(inputApis.length === 0)
        this.error('Provide API names in proper format. Refer tcam:validate-apis --help for examples.')
      }
      // Path is a file
      if (fs.lstatSync(path).isFile()) {
          const fileDetails = this.extensionChecker(path);
          const fileData = fs.readFileSync(path, 'utf-8');
          const api = fileDetails.extension === '.json' ? JSON.parse(fileData) : load(fileData);
          const fileStringData = fileDetails.extension === '.json' ? fileData : JSON.stringify(api);
          this.readApi(api, apiArr, { SK: null }, fileDetails.name, fileStringData);
      }
      //Path is a directory
      else {
          let files:string[] = await this.readDir(path);
          if(flags.apinames){
           files = files.filter((name:string) => {
              return  inputApis.includes(name.split('.')[0]);
            })
          }
          for (const file of files) {
              const fpath = join(path, file);
              const fileDetails = this.extensionChecker(fpath);
              const fileData = await this.readFileAsync(fpath, fileDetails.name);
              const api = fileDetails.extension === '.json' ? JSON.parse(fileData) : load(fileData);
              const fileStringData = fileDetails.extension === '.json' ? fileData : JSON.stringify(api);
              this.readApi(api, apiArr, { SK: null }, fileDetails.name, fileStringData);
          }
      }
      const payload = { apiList: apiArr };
      const res: any = await tcReq.doRequest(CLIAPIS.validateapis, { method: 'POST'}, payload);
      this.spinner.succeed(`APIs validated successfully!`);
      for (const api of res.body.result) {
          if (api.result.message === 'API is valid') {
              this.spinner.succeed(`${chalk.green.bold(api.fileName)} is a valid API`);
          }
          else {
              this.error(`API spec ${chalk.red.bold(api.fileName)} contains validation error(s): ${api.result.message}`,{exit:false});
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
  public readApi = (api: any, apiArr: ImportApi[], project: any, fileName: string, fileData: any): void => {
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
  async catch(err: Error) {
    if(this.spinner)
      this.spinner.fail();
      return super.catch(err);
  }
  async finally(err: Error) {
      return super.finally(err);
  }
}