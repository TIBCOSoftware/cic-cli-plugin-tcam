/**
 * Copyright 2022. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */
import { flags } from '@oclif/command'
import { chalk, TCBaseCommand, TCRequest, ux } from '@tibco-software/cic-cli-core'
import { CLIAPIS } from '../../utils/url.constants';

export default class TcamCreateProject extends TCBaseCommand {
  static description = 'Create a project';
  static examples: string[] | undefined = [`tibco tcam:create-project --name "Cli Project"`,
    `tibco tcam:create-project -n "Cli Project"`];
  spinner!:  Awaited<ReturnType<typeof ux.spinner>>;
  static flags: flags.Input<any> & typeof TCBaseCommand.flags = {
    ...TCBaseCommand.flags,
    help: flags.help({ char: 'h' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
    name: flags.string({ char: 'n', description: 'Specify a project name', required: true })
  }

  async init() {
    await super.init();
    this.spinner = await ux.spinner();
    // Do any other  initialization
  }

  async run() {
    const { flags } = this.parse(TcamCreateProject);
    const projectname = flags.name.trim();
    let tcReq: TCRequest = this.getTCRequest();
    this.spinner.start("creating project...");
    const res = await tcReq.doRequest(CLIAPIS.createproject, { method: 'POST' }, { projectName: projectname });
    if (res.body.message === 'Project with same name already exists') {
      throw { httpResponse: { message: `${chalk.red.bold(projectname)} already exists` } }
    }
    this.spinner.succeed('Project created successfully.');

  }
  async catch(err: any) {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    if(this.spinner)
    this.spinner.fail('failed');
    if (err?.httpResponse?.message)
      err = { message: err?.httpResponse?.message }
    return super.catch(err);
  }
  async finally(err: Error) {
    // called after run and catch regardless of whether or not the command errored
    return super.finally(err);
  }
}
