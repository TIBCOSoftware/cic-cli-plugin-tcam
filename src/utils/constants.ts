export type ImportApi = {
    apiName: string,
    apiVersion: string,
    projectName?: string,
    apiSpecType: string,
    schemaType: string,
    content: string,
    apiContentType:string
  }

export type FileDetails = {
  name: string, 
  extension: string
}

export type ProcessApiParams = {
  fileDetails:FileDetails,
  fileData:string,
  apiArr:ImportApi[],
  projectName?:string
}

export type ApiPayloadParams = ProcessApiParams & {
  api: any
}

export type ExportApiPayload = {
  projectId: string,
  apiNames?: string[]
}
  