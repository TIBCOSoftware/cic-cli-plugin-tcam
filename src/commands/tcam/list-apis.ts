/**
 * Copyright 2022. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */
import { flags } from '@oclif/command';
import { TCBaseCommand, TCRequest, ux } from '@tibco-software/cic-cli-core';
import { CLIAPIS } from '../../utils/url.constants';

export default class TcamListApis extends TCBaseCommand {
  static description = 'List APIs';
  static examples: string[] | undefined = [`tibco tcam:list-apis`,
    `tibco tcam:list-apis --projectnames "Cli Project"`, `tibco tcam:list-apis --projectnames "Cli Project,AuthProject"`,
    `tibco tcam:list-apis --apitypes "openapi"`, `tibco tcam:list-apis -p "AuthProject" -t "openapi"`,
    `tibco tcam:list-apis --apinames "CliAsyncApi,CliOpenApi"`
  ];
  spinner!: Awaited<ReturnType<typeof ux.spinner>>;
  static flags: flags.Input<any> & typeof TCBaseCommand.flags = {
    ...TCBaseCommand.flags,
    help: flags.help({ char: 'h' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
    projectnames: flags.string({ char: 'p', description: 'Specify project names' }),
    apitypes: flags.string({ char: 't', description: 'API types you want to list. For example openapi,asyncapi' }),
    apinames: flags.string({ char: 'a', description: 'Specify API names' })
  }

  async init() {
    await super.init();
    // Do any other  initialization
    this.spinner = await ux.spinner();
  }

  async run() {
    const { flags } = this.parse(TcamListApis);
    let params = new URLSearchParams();
    if (flags.projectnames) {
      this.addListParams(params, flags.projectnames, 'projectNames');
    }
    if (flags.apitypes) {
      this.addListParams(params, flags.apitypes, 'apiTypes');
    }
    if (flags.apinames) {
      this.addListParams(params, flags.apinames, 'apiNames');
    }
    let tcReq: TCRequest = this.getTCRequest();
    this.spinner.start("fetching apis...");
    const res = await tcReq.doRequest(CLIAPIS.getapis, { method: 'GET', params: params });
    const apis = res.body.api;
    if (apis.length > 0) {
      this.spinner.succeed("APIs fetched");
      const displayApis = [];
      for (const api of apis) {
        displayApis.push({
          'API name': api.apiName, 'Project name': api.projectName, 'Type': api.apiType, 'Version': api.version,
          'Created by': api.createdBy.uname
        })
      }
      await ux.showTable(displayApis, 'APIs');
    } else {
      this.spinner.fail("No APIs found");
    }
  }

  async catch(err: Error) {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    if (this.spinner)
      this.spinner.fail('failed');
    return super.catch(err);
  }

  async finally(err: Error) {
    // called after run and catch regardless of whether or not the command errored
    return super.finally(err);
  }

  addListParams(params: URLSearchParams, flagValue: string, paramName: string): void {
    flagValue
      .split(',')
      .forEach(item => {
         params.append(paramName, item.trim())
      });  
  }

}
