/**
 * Copyright 2022. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */
import { flags } from '@oclif/command'
import { chalk, TCBaseCommand, ux } from '@tibco-software/cic-cli-core';
import { join } from 'path';
import { promises as fsPromises, lstatSync, readFileSync } from 'fs';
import { FileDetails, ImportApi } from '../../utils/constants';
import { CLIAPIS } from '../../utils/url.constants';
import { extensionChecker, processApi } from '../../utils/common.functions';

export default class TcamValidateApis extends TCBaseCommand {
    static description = 'Validate API specs';
    static examples: string[] | undefined = [
        `tibco tcam:validate-apis --from "C:/Users/myuser/Desktop/Upload/ImportApi.json"`,
        `tibco tcam:validate-apis -f "C:/Users/myuser/Desktop/Upload/ImportProject"`,
        `tibco tcam:validate-apis --from "C:/Users/myuser/Desktop/Upload/ImportProject" --apinames "bankapi,yamlapi"`,
        `tibco tcam:validate-apis -f "C:/Users/myuser/Desktop/Upload/ImportProject" -a "bankapi,yamlapi"`
    ];
    spinner: any;
    static flags: flags.Input<any> & typeof TCBaseCommand.flags = {
        ...TCBaseCommand.flags,
        help: flags.help({ char: 'h' }),
        from: flags.string({
            char: 'f',
            description: 'Specify the location of an API spec or directory',
            required: true,
        }),
        apinames: flags.string({ char: 'a', description: 'API names that need to be validated from the directory' })
    }

    async init() {
        await super.init();
        // Do any other  initialization
        this.spinner = await ux.spinner();
    }
    
    async run() {
        const { flags } = this.parse(TcamValidateApis);
        const path = flags.from.trim();
        const apiArr: ImportApi[] = [];
        let inputApis: any[] = [];
        let tcReq = this.getTCRequest();
        this.spinner.start("Validating APIs...");
        if (flags.apinames) {
            inputApis = flags.apinames.split(',').map((name: any) => name.trim());
            if (inputApis.length === 0)
                this.error('Provide API names in proper format. Refer tcam:validate-apis --help for examples.');
        }
        // Path is a file
        if (lstatSync(path).isFile()) {
            const fileDetails: FileDetails = extensionChecker(path);
            const fileData = readFileSync(path, 'utf-8');
            processApi({
                fileDetails: fileDetails,
                fileData: fileData,
                apiArr: apiArr
              });
        }
        //Path is a directory
        else {
            let files: string[] = await fsPromises.readdir(path);
            if (flags.apinames) {
                files = files.filter((name: string) => {
                    return inputApis.includes(name.split('.')[0]);
                })
            }
            for (const file of files) {
                const fpath = join(path, file);
                const fileDetails: FileDetails = extensionChecker(fpath);
                const fileData = await fsPromises.readFile(fpath, { encoding: 'utf8' });
                processApi({
                    fileDetails: fileDetails,
                    fileData: fileData,
                    apiArr: apiArr
                  });
            }
        }
        const payload = { apiList: apiArr };
        const res: any = await tcReq.doRequest(CLIAPIS.validateapis, { method: 'POST' }, payload);
        this.spinner.succeed(`APIs validated successfully.`);
        for (const api of res.body.result) {
            if (api.result.message === 'API is valid') {
                this.spinner.succeed(`${chalk.green.bold(api.fileName)} is a valid API`);
            }
            else {
                this.error(`API spec ${chalk.red.bold(api.fileName)} contains validation error(s): ${api.result.message}`, { exit: false });
            }
        }
    }

    async catch(err: Error) {
        if (this.spinner)
            this.spinner.fail();
        return super.catch(err);
    }
    async finally(err: Error) {
        return super.finally(err);
    }
}