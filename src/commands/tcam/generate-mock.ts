import { flags } from '@oclif/command';
import { chalk, HTTPError, TCBaseCommand, TCRequest, ux } from '@tibco-software/cic-cli-core';
import { homedir } from 'os';
import { join } from 'path';
import * as AdmZip from "adm-zip";
import { promises as fsPromises } from 'fs';
import { lstatSync, unlinkSync, existsSync } from 'fs';
import { tmpdir } from "os";
import { CLIAPIS } from '../../utils/url.constants';
import * as manifest_json from '../../utils/manifest.json';
import { load } from 'js-yaml';
import { extensionChecker } from '../../utils/common.functions';
import { FileDetails } from '../../utils/constants';
const $RefParser = require("@apidevtools/json-schema-ref-parser");
const codegen = require('../../../assets/codegen-swagger-express');
const DATE = Date.now();

export default class TcamGenMock extends TCBaseCommand {
  static description = 'Generate a NodeJS mock app';
  static examples: string[] | undefined =
    [`tibco tcam:generate-mock --from "C:/Users/myuser/Desktop/Upload/ImportApi.json" --deploy --static`,
      `tibco tcam:generate-mock --project NodeProj --api Petstore --deploy`,
      `tibco tcam:generate-mock -f "C:/Users/myuser/Desktop/Upload/ImportApi.json" -d -s`];
  // spinner: typeof ux.spinner;
  tcReq: TCRequest = this.getTCRequest();
  spinner!:  Awaited<ReturnType<typeof ux.spinner>>;
  tmpStorage = '';
  static flags: flags.Input<any> & typeof TCBaseCommand.flags = {
    ...TCBaseCommand.flags,
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: 'n', description: 'App name' }),
    // flag with no value (-f, --force)
    from: flags.string({
      char: 'f',
      description: 'Specify the JSON/YAML file path of an OpenAPI spec ',
    }),
    project: flags.string({
      char: "p",
      description: "Specify project name",
    }),
    api: flags.string({
      char: "a",
      description: "Specify the API to be pulled from the API modeler ",
    }),
    deploy: flags.boolean({
      char: "d",
      description: "Deploy the generated app on TCI",
    }),
    static: flags.boolean({
      char: "s",
      description: "Generate static response rather than dynamic",
      default: false
    }),
    version: flags.string({
      char: "v",
      description: "Specify the API version ",
    })

  }

  async init() {
    await super.init();
    // Do any other  initialization
     this.spinner = await ux.spinner();
  }

  async run() {
    const { flags } = this.parse(TcamGenMock);
    if (!(flags.from || (flags.project && flags.api))) {
      throw { message: ' Provide either JSON/YAML file path of an OpenAPI spec or Project and API name' };
    }
    this.spinner.start("generating app...");
    let spec;
    let specName = '';
    if (flags.from) {
      const fpath = flags.from.trim();
      if (!lstatSync(fpath).isFile()) {
        throw { message: `Provided path is not a file.` }
      }
      const fileDetails: FileDetails = extensionChecker(fpath);
      specName = fileDetails.name;
      spec = await this.generateAppUsingFile(fpath, fileDetails);
      const apiArr = [
        {
          apiName: specName,
          apiSpecType: 'openapi',
          schemaType: 'OAS3.0',
          content: JSON.stringify(spec),
          apiVersion: '1.0',
          apiContentType: 'json'
        }
      ];
      const payload = { apiList: apiArr };
      const res = await this.tcReq.doRequest(CLIAPIS.validateapis, { method: 'POST' }, payload);
      if (res.body.result[0].result?.message !== 'API is valid') {
        throw { message: `${chalk.red.bold(fileDetails.name)}  file is not a valid open api.` }
      }
    }
    else {
      spec = await this.generateAppUsingSpec(flags.project.trim(), flags.api.trim(), flags);
      specName = flags.api.trim();
    }
    spec = await $RefParser.dereference(spec);
    spec.info.version = /^(\d\.){2}\d$/.test(spec.info.version) ? spec.info.version : '1.0.0';
    specName = flags.name?.trim() || specName;
    const parentFolder = `${specName}_${DATE}`;
    await fsPromises.mkdir(join(homedir(), 'Downloads', parentFolder));
    const genName = await this.generateCode(spec, parentFolder, specName, flags.static);
    await this.genManifest(spec, genName, join(homedir(), 'Downloads', parentFolder, 'manifest.json'));
    this.spinner.succeed(`NodeJS app generated successfully in the Downloads folder.`);
    if (flags.deploy) {
      this.spinner.start('deploying app...');
      await this.pushApp(parentFolder, genName);
      this.spinner.succeed(`App deployed successfully on TCI.`);
      if (existsSync(this.tmpStorage)) {
        unlinkSync(this.tmpStorage);
      }
    }
  }

  async catch(err: any) {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    if (existsSync(this.tmpStorage)) {
      unlinkSync(this.tmpStorage);
    }
    if (err instanceof HTTPError) {
      this.error(`Error Occured.\n ${"Details: " + chalk.red(err.httpResponse?.errorDetail)}`);
    }
    if (this.spinner)
      this.spinner.fail('failed');
    return super.catch(err);
  }

  async finally(err: Error) {
    // called after run and catch regardless of whether or not the command errored
    return super.finally(err);
  }

  async pushApp(parentFolder: string, genName: string): Promise<any> {
    let tmpDir = tmpdir();
    this.tmpStorage = join(tmpDir, `${genName}.zip`);
    const manifestPath = join(homedir(), 'Downloads', parentFolder, 'manifest.json');
    let zip = new AdmZip();
    zip.addLocalFolder(join(homedir(), 'Downloads', parentFolder, genName));
    zip.writeZip(this.tmpStorage);
    return this.tcReq.upload(`/tci/v1/subscriptions/0/apps?appName=${genName}&instanceCount=1`, {
      artifact: `file://${this.tmpStorage}`,
      "manifest.json": `file://${manifestPath}`,
    });
  }

  async generateAppUsingSpec(projectName: string, apiName: string, flags: any): Promise<void> {
    let params = new URLSearchParams();
    params.append('projectNames', projectName)
    params.append('apiNames', apiName);
    const res = await this.tcReq.doRequest(CLIAPIS.apisdata, { method: 'GET', params: params });
    if (res.body.api.length > 1) {
      const displayApis = [];
      for (const api of res.body.api) {
        displayApis.push({
          'API name': api.apiName, 'Project name': api.projectName, 'Type': api.apiType, 'Version': api.version,
          'Created by': api.createdBy.uname
        })
      }
      this.spinner.stop();
      await ux.showTable(displayApis, 'APIs');
      let versionAns = await ux.prompt('Enter version of API ?', 'input', flags.version);
      versionAns = versionAns.trim();
      this.spinner.start("generating app...");
      const versionAPI = res.body.api.find((api: any) => api.version === versionAns);
      return JSON.parse(versionAPI.content);
    } else if (res.body.api.length === 1) {
      return JSON.parse(res.body.api[0].content);
    } else {
      throw { message: 'No API found' }
    }
  }

  async generateAppUsingFile(filePath: string, fileDetails: any): Promise<any> {
    const fileData = await fsPromises.readFile(filePath, { encoding: 'utf8' });
    if (fileDetails.extension === '.json') {
      return JSON.parse(fileData);
    }
    return load(fileData);
  }

  async genManifest(spec: any, name: string, manifestPath: string): Promise<any> {
    let manifest: any = manifest_json;
    manifest.name = name;
    manifest.version = spec.info.version;
    const description = spec.info.description || 'node-app';
    const title = spec.info.title;
    manifest.description = description;
    manifest.endpoints[0].swagger = spec;
    manifest.endpoints[0].spec.name = title;
    manifest.endpoints[0].spec.description = description;
    return fsPromises.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  }

  async generateCode(spec: any, folderName: string, specName: string, staticResp: boolean): Promise<string> {
    const dynamic = !staticResp;
    const specFolderName: string = specName;
    spec.info.title = specFolderName;
    const copySpec = JSON.parse(JSON.stringify(spec));
    const genPath = join(homedir(), 'Downloads', folderName, specFolderName);
    await codegen.generate({
      swagger: copySpec,
      target_dir: genPath,
      dynamic: dynamic
    });
    return specFolderName;
  }
}
