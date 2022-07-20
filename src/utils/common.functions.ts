import { extname, basename} from 'path';
import { chalk } from '@tibco-software/cic-cli-core';
import { load } from 'js-yaml';
import { ImportApi } from './constants';

export const extensionChecker = (path: string) => {
    const name = basename(path);
    const ext = extname(path);
    const fileName = basename(name, ext);
    if (ext !== '.json' && ext !== '.yml' && ext !== '.yaml') {
      throw { message: `${chalk.red.bold(fileName)} File is not of type json or yaml` }
    }
    return { name: fileName, extension: ext };
  }
 
 export const  processApi = (fileDetails:any,fileData:any,apiArr:ImportApi[],inputProjName?:string):void => {
  const api = fileDetails.extension === '.json' ? JSON.parse(fileData) : load(fileData);
  const fileStringData = fileDetails.extension === '.json' ? fileData : JSON.stringify(api);
  const fileName = fileDetails.name;
  const fileExt = fileDetails.extension;
  createApiPayload(api, apiArr,fileName, fileStringData,fileExt,inputProjName);
 }

 const keyExist = (obj:any,key:string): boolean => {
    return Object.prototype.hasOwnProperty.call(obj,key);
 }
 const createApiPayload = (api: any, apiArr: ImportApi[], fileName: string, fileData: any,ext:string, project?: any): void => {
   if (!keyExist(api,'openapi') && !keyExist(api,'asyncapi') && !keyExist(api,'swagger')) {
     throw { message: `${chalk.red.bold(fileName)} File is not valid for OpenAPI or AsyncAPI specifications.` }
   }
   const importApi: ImportApi = {}
   if (keyExist(api,'asyncapi')) {
     importApi.apiSpecType = 'asyncapi';
     importApi.schemaType = 'A2S2.0';
   }
   else if (keyExist(api,'openapi') || keyExist(api,'swagger')) {
     importApi.apiSpecType = 'openapi';
     importApi.schemaType = keyExist(api,'openapi') ? 'OAS3.0' : 'OAS2.0';
   }
   ext === '.json' ? importApi.apiContentType = 'json' : importApi.apiContentType = 'yaml';
   importApi.apiName = fileName;
   importApi.content = fileData;
   importApi.apiVersion = api.info.version ? api.info.version : '1.0';
   if(project)
   importApi.projectName = project;
   apiArr.push(importApi);
 }