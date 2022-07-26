/**
 * Copyright 2022. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */
import {flags} from '@oclif/command';
import {TCBaseCommand,TCRequest,ux} from '@tibco-software/cic-cli-core';
import { CLIAPIS } from '../../utils/url.constants';

export default class TcamListProjects extends TCBaseCommand {
  static description = "List projects";
  static examples: string[] | undefined = ["tibco tcam:list-projects",
  `tibco tcam:list-projects --projectnames "Cli Project, UI Project"`,
  `tibco tcam:list-projects -p "Cli Project, UI Project"`
   ];
  spinner!: Awaited<ReturnType<typeof ux.spinner>>;
  static flags: flags.Input<any> & typeof TCBaseCommand.flags = {
    ...TCBaseCommand.flags,
    help: flags.help({char: 'h'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
    projectnames: flags.string({char: 'p', description: 'Specify project names'}),
  }

  async init() {
    await super.init();
    // Do any other  initialization
   this.spinner = await ux.spinner();
  }

  async run() {
    const {flags} = this.parse(TcamListProjects);
    let projects = [];
    let params = new URLSearchParams();
    if(flags.projectnames){
      projects = flags.projectnames.split(',').map((name:string) => name.trim());
       projects.forEach((proj:string) => {
         params.append('projectNames',proj);
       });
    }
   let tcReq: TCRequest = this.getTCRequest();
    this.spinner.start("fetching projects...");
    const res = await tcReq.doRequest(CLIAPIS.getprojects,{method:'GET',params:params});
   const projectsArr = res.body.projects;
   if(projectsArr.length > 0){
    this.spinner.succeed("Projects fetched");
     const displayProjects = [];
     for(const project of projectsArr){
       displayProjects.push({'Project name':project.projectName,'APIs':project.noOfApi,'API types':project.apiTypes,
       'Last modified':new Date(Date.parse(project.updatedAt)).toString().split('GMT')[0],
       'Last modified by':project.lastModifiedBy.uname})
    }  
    await ux.showTable(displayProjects, 'PROJECTS');
   }else{
    this.spinner.fail("No Projects found");
   }
  }

  async catch(err: Error) {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    if(this.spinner)
    this.spinner.fail('failed');
    return super.catch(err);
  }
  
  async finally(err: Error) {
    // called after run and catch regardless of whether or not the command errored
    return super.finally(err);
  }
}
