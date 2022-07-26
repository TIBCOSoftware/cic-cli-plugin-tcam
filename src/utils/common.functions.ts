import { extname, basename} from 'path';
import { chalk } from '@tibco-software/cic-cli-core';
import { load } from 'js-yaml';
import { ApiPayloadParams, FileDetails, ImportApi, ProcessApiParams } from './constants';

export const extensionChecker = (path: string): FileDetails => {
    const name = basename(path);
    const ext = extname(path);
    const fileName = basename(name, ext);
    if (ext !== '.json' && ext !== '.yml' && ext !== '.yaml') {
      throw { message: `${chalk.red.bold(fileName)} File is not of type json or yaml` }
    }
    return { name: fileName, extension: ext };
  }
 
 export const processApi = (apiParams: ProcessApiParams): void => {
  const api = apiParams.fileDetails.extension === '.json' ? JSON.parse(apiParams.fileData) : load(apiParams.fileData);
  const fileStringData = apiParams.fileDetails.extension === '.json' ? apiParams.fileData : JSON.stringify(api);
  const apiPayload: ApiPayloadParams = {
    ...apiParams,
    api: api,
    fileData: fileStringData
  }
  createApiPayload(apiPayload);
 }

 const keyExist = (obj:object, key:string): boolean => {
    return Object.prototype.hasOwnProperty.call(obj,key);
 }

 const createApiPayload = (payloadParams: ApiPayloadParams): void => {
   const api = payloadParams.api;
   if (!keyExist(api,'openapi') && !keyExist(api,'asyncapi') && !keyExist(api,'swagger')) {
     throw { message: `${chalk.red.bold(payloadParams.fileDetails.name)} 
     File is not valid for OpenAPI or AsyncAPI specifications.` }
   }
   const importApi: ImportApi = {
    apiName: '',
    apiVersion: '',
    apiSpecType: '',
    schemaType: '',
    content: '',
    apiContentType: ''
   }
   if (keyExist(api,'asyncapi')) {
     importApi.apiSpecType = 'asyncapi';
     importApi.schemaType = 'A2S2.0';
   }
   else {
     importApi.apiSpecType = 'openapi';
     importApi.schemaType = keyExist(api,'openapi') ? 'OAS3.0' : 'OAS2.0';
   }
   importApi.apiContentType = payloadParams.fileDetails.extension === '.json' ? 'json' : 'yaml';
   importApi.apiName = payloadParams.fileDetails.name;
   importApi.content = payloadParams.fileData;
   importApi.apiVersion = api.info.version || '1.0';
   if(payloadParams.projectName)
   importApi.projectName = payloadParams.projectName;
   payloadParams.apiArr.push(importApi);
 }