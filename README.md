 CLI Plugin for TIBCO Cloud™ API Modeler 
===================

This is a CLI Plugin which will provide you the ability to run basic commands for TIBCO Cloud API Modeler features via the command line interface.

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

A detailed [step-by-step walkthrough for the CLI plugin usage is available here.](https://www.walkthrough.so/pblc/vkrdRQuzhTig/cli-plugin-for-tibco-cloud-tm-api-modeler?sn=6)

# Usage
Install CLI Main by following step #1 (i to v) from the instructions provided at https://github.com/TIBCOSoftware/cic-cli-main under the Installation topic.
```sh-session
 Install TCAM CLI Plugin
   $ tibco plugins:install @tibco-software/cli-plugin-tcam
 
 USAGE
  $ tibco tcam:COMMAND
```
# Commands
<!-- commands -->
* [`tibco tcam:create-project`](#tibco-tcamcreate-project)
* [`tibco tcam:export-apis`](#tibco-tcamexport-apis)
* [`tibco tcam:import-apis`](#tibco-tcamimport-apis)
* [`tibco tcam:list-apis`](#tibco-tcamlist-apis)
* [`tibco tcam:list-projects`](#tibco-tcamlist-projects)
* [`tibco tcam:validate-apis`](#tibco-tcamvalidate-apis)

## `tibco tcam:create-project`

Creates a project

```
USAGE
  $ tibco tcam:create-project

OPTIONS
  -f, --force
  -h, --help                     show CLI help
  -p, --projectname=projectname  (required) Project name
  --no-warnings                  Disable warnings from commands outputs
  --profile=profile              Switch to different org or region using profile

EXAMPLE
  tibco tcam:create-project -p 'Cli Project'
```

_See code: [src/commands/tcam/create-project.ts](https://github.com/TIBCOSoftware/cic-cli-plugin-tcam/blob/v1.0.0/src/commands/tcam/create-project.ts)_

## `tibco tcam:export-apis`

Exports APIs to local file system

```
USAGE
  $ tibco tcam:export-apis

OPTIONS
  -a, --apinames=apinames        Specify the API names that need to be exported
  -f, --force
  -h, --help                     show CLI help
  -p, --projectname=projectname  (required) Exports the APIs of the specified project
  -y, --yaml                     Exports APIs in yaml format
  --no-warnings                  Disable warnings from commands outputs
  --profile=profile              Switch to different org or region using profile

EXAMPLES
  tibco tcam:export-apis -p 'Cli Project'
  tibco tcam:export-apis -p 'Cli Project' -a 'InvalidApi,CliOpenApi' -y
```

_See code: [src/commands/tcam/export-apis.ts](https://github.com/TIBCOSoftware/cic-cli-plugin-tcam/blob/v1.0.0/src/commands/tcam/export-apis.ts)_

## `tibco tcam:import-apis`

Imports API specs

```
USAGE
  $ tibco tcam:import-apis

OPTIONS
  -f, --force
  -h, --help                     show CLI help

  -l, --location=location        (required) Specify the location or path of an API spec or a directory containing one or
                                 more API specs that need to be imported to a Project

  -p, --projectname=projectname  (required) Specify the project name to which the API spec needs to be imported. The
                                 project must exist in the organization.

  --no-warnings                  Disable warnings from commands outputs

  --profile=profile              Switch to different org or region using profile

EXAMPLES
  tibco tcam:import-apis -l 'C:/Users/myuser/Desktop/Upload/ImportApi.json' -p 'TestProject'
  tibco tcam:import-apis -l 'C:/Users/myuser/Desktop/Upload/ImportProject' -p 'TestProject'
```

_See code: [src/commands/tcam/import-apis.ts](https://github.com/TIBCOSoftware/cic-cli-plugin-tcam/blob/v1.0.0/src/commands/tcam/import-apis.ts)_

## `tibco tcam:list-apis`

Lists APIs

```
USAGE
  $ tibco tcam:list-apis

OPTIONS
  -a, --apinames=apinames        API names
  -f, --force
  -h, --help                     show CLI help
  -p, --projectname=projectname  Project names
  -t, --apitypes=apitypes        API types you want to list. For example openapi,asyncapi
  --no-warnings                  Disable warnings from commands outputs
  --profile=profile              Switch to different org or region using profile

EXAMPLES
  tibco tcam:list-apis
  tibco tcam:list-apis -p 'Cli Project'
  tibco tcam:list-apis -p 'Cli Project,AuthProject'
  tibco tcam:list-apis -t 'openapi'
  tibco tcam:list-apis -p 'AuthProject' -t 'openapi'
  tibco tcam:list-apis -a 'CliAsyncApi,CliOpenApi'
```

_See code: [src/commands/tcam/list-apis.ts](https://github.com/TIBCOSoftware/cic-cli-plugin-tcam/blob/v1.0.0/src/commands/tcam/list-apis.ts)_

## `tibco tcam:list-projects`

Lists projects

```
USAGE
  $ tibco tcam:list-projects

OPTIONS
  -f, --force
  -h, --help                       show CLI help
  -p, --projectnames=projectnames  Project names
  --no-warnings                    Disable warnings from commands outputs
  --profile=profile                Switch to different org or region using profile

EXAMPLES
  tibco tcam:list-projects
  tibco tcam:list-projects -p 'Cli Project, UI Project'
```

_See code: [src/commands/tcam/list-projects.ts](https://github.com/TIBCOSoftware/cic-cli-plugin-tcam/blob/v1.0.0/src/commands/tcam/list-projects.ts)_

## `tibco tcam:validate-apis`

Validate API specs

```
USAGE
  $ tibco tcam:validate-apis

OPTIONS
  -a, --apinames=apinames  API names that need to be validated from the directory
  -f, --force
  -h, --help               show CLI help

  -l, --location=location  (required) Specify the location or path of an API spec or a directory containing one or more
                           API specs

  --no-warnings            Disable warnings from commands outputs

  --profile=profile        Switch to different org or region using profile

EXAMPLES
  tibco tcam:validate-apis -l 'C:/Users/myuser/Desktop/Upload/ImportApi.json'
  tibco tcam:validate-apis -l 'C:/Users/myuser/Desktop/Upload/ImportProject'
  tibco tcam:validate-apis -l 'C:/Users/myuser/Desktop/Upload/ImportProject -a 'bankapi,yamlapi'
```

_See code: [src/commands/tcam/validate-apis.ts](https://github.com/TIBCOSoftware/cic-cli-plugin-tcam/blob/v1.0.0/src/commands/tcam/validate-apis.ts)_
<!-- commandsstop -->
