 CLI Plugin for TIBCO Cloud™ API Modeler 
===================

This is a CLI Plugin which will provide you the ability to run basic commands for TIBCO Cloud API Modeler features via the command line interface.

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->


A detailed [step-by-step walkthrough for the CLI plugin usage is available here.](https://www.walkthrough.so/pblc/QPaTYNPVOfUP/cli-plugin-for-tibco-cloud-tm-api-modeler?usp=sharing)

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
* [`tibco tcam:generate-mock`](#tibco-tcamgenerate-mock)
* [`tibco tcam:import-apis`](#tibco-tcamimport-apis)
* [`tibco tcam:list-apis`](#tibco-tcamlist-apis)
* [`tibco tcam:list-projects`](#tibco-tcamlist-projects)
* [`tibco tcam:validate-apis`](#tibco-tcamvalidate-apis)

## `tibco tcam:create-project`

Create a project

```
USAGE
  $ tibco tcam:create-project

OPTIONS
  -f, --force
  -h, --help         show CLI help
  -n, --name=name    (required) Specify a project name
  --config=config    Path to the local config file
  --no-warnings      Disable warnings from command's output
  --profile=profile  Switch to different org or region using profile

EXAMPLES
  tibco tcam:create-project --name "Cli Project"
  tibco tcam:create-project -n "Cli Project"
```

_See code: [src/commands/tcam/create-project.ts](https://github.com/TIBCOSoftware/cic-cli-plugin-tcam/blob/v1.0.2/src/commands/tcam/create-project.ts)_

## `tibco tcam:export-apis`

Export APIs to a local file system

```
USAGE
  $ tibco tcam:export-apis

OPTIONS
  -a, --apinames=apinames        Specify APIs to export by name
  -f, --force
  -h, --help                     show CLI help
  -p, --projectname=projectname  (required) Export APIs for the specified project
  -y, --yaml                     Export APIs in YAML format
  --config=config                Path to the local config file
  --no-warnings                  Disable warnings from command's output
  --profile=profile              Switch to different org or region using profile

EXAMPLES
  tibco tcam:export-apis --projectname "Cli Project"
  tibco tcam:export-apis --projectname "Cli Project" --apinames 'InvalidApi,CliOpenApi" --yaml
  tibco tcam:export-apis -p "Cli Project" -a "InvalidApi,CliOpenApi" -y
```

_See code: [src/commands/tcam/export-apis.ts](https://github.com/TIBCOSoftware/cic-cli-plugin-tcam/blob/v1.0.2/src/commands/tcam/export-apis.ts)_

## `tibco tcam:generate-mock`

Generate a NodeJS mock app

```
USAGE
  $ tibco tcam:generate-mock

OPTIONS
  -a, --api=api          Specify the API to be pulled from the API modeler
  -d, --deploy           Deploy the generated app on TCI
  -f, --from=from        Specify the JSON/YAML file path of an OpenAPI spec
  -h, --help             show CLI help
  -n, --name=name        App name
  -p, --project=project  Specify project name
  -s, --static           Generate static response rather than dynamic
  -v, --version=version  Specify the API version
  --config=config        Path to the local config file
  --no-warnings          Disable warnings from command's output
  --profile=profile      Switch to different org or region using profile

EXAMPLES
  tibco tcam:generate-mock --from "C:/Users/myuser/Desktop/Upload/ImportApi.json" --deploy --static
  tibco tcam:generate-mock --project NodeProj --api Petstore --deploy
  tibco tcam:generate-mock -f "C:/Users/myuser/Desktop/Upload/ImportApi.json" -d -s
```

_See code: [src/commands/tcam/generate-mock.ts](https://github.com/TIBCOSoftware/cic-cli-plugin-tcam/blob/v1.0.2/src/commands/tcam/generate-mock.ts)_

## `tibco tcam:import-apis`

Import API specs

```
USAGE
  $ tibco tcam:import-apis

OPTIONS
  -f, --from=from                (required) Specify the location of an API spec or directory
  -h, --help                     show CLI help
  -n, --newproject=yes           Specify to create new project if it doesn't exist in the organization

  -p, --projectname=projectname  (required) Specify the target project name for the API import. The project must exist
                                 in the organization.

  --config=config                Path to the local config file

  --no-warnings                  Disable warnings from command's output

  --profile=profile              Switch to different org or region using profile

EXAMPLES
  tibco tcam:import-apis --from 'C:/Users/myuser/Desktop/Upload/ImportApi.json' --projectname 'TestProject'
  tibco tcam:import-apis -f 'C:/Users/myuser/Desktop/Upload/ImportProject' -p 'TestProject'
```

_See code: [src/commands/tcam/import-apis.ts](https://github.com/TIBCOSoftware/cic-cli-plugin-tcam/blob/v1.0.2/src/commands/tcam/import-apis.ts)_

## `tibco tcam:list-apis`

List APIs

```
USAGE
  $ tibco tcam:list-apis

OPTIONS
  -a, --apinames=apinames          Specify API names
  -f, --force
  -h, --help                       show CLI help
  -p, --projectnames=projectnames  Specify project names
  -t, --apitypes=apitypes          API types you want to list. For example openapi,asyncapi
  --config=config                  Path to the local config file
  --no-warnings                    Disable warnings from command's output
  --profile=profile                Switch to different org or region using profile

EXAMPLES
  tibco tcam:list-apis
  tibco tcam:list-apis --projectnames "Cli Project"
  tibco tcam:list-apis --projectnames "Cli Project,AuthProject"
  tibco tcam:list-apis --apitypes "openapi"
  tibco tcam:list-apis -p "AuthProject" -t "openapi"
  tibco tcam:list-apis --apinames "CliAsyncApi,CliOpenApi"
```

_See code: [src/commands/tcam/list-apis.ts](https://github.com/TIBCOSoftware/cic-cli-plugin-tcam/blob/v1.0.2/src/commands/tcam/list-apis.ts)_

## `tibco tcam:list-projects`

List projects

```
USAGE
  $ tibco tcam:list-projects

OPTIONS
  -f, --force
  -h, --help                       show CLI help
  -p, --projectnames=projectnames  Specify project names
  --config=config                  Path to the local config file
  --no-warnings                    Disable warnings from command's output
  --profile=profile                Switch to different org or region using profile

EXAMPLES
  tibco tcam:list-projects
  tibco tcam:list-projects --projectnames "Cli Project, UI Project"
  tibco tcam:list-projects -p "Cli Project, UI Project"
```

_See code: [src/commands/tcam/list-projects.ts](https://github.com/TIBCOSoftware/cic-cli-plugin-tcam/blob/v1.0.2/src/commands/tcam/list-projects.ts)_

## `tibco tcam:validate-apis`

Validate API specs

```
USAGE
  $ tibco tcam:validate-apis

OPTIONS
  -a, --apinames=apinames  API names that need to be validated from the directory
  -f, --from=from          (required) Specify the location of an API spec or directory
  -h, --help               show CLI help
  --config=config          Path to the local config file
  --no-warnings            Disable warnings from command's output
  --profile=profile        Switch to different org or region using profile

EXAMPLES
  tibco tcam:validate-apis --from "C:/Users/myuser/Desktop/Upload/ImportApi.json"
  tibco tcam:validate-apis -f "C:/Users/myuser/Desktop/Upload/ImportProject"
  tibco tcam:validate-apis --from "C:/Users/myuser/Desktop/Upload/ImportProject" --apinames "bankapi,yamlapi"
  tibco tcam:validate-apis -f "C:/Users/myuser/Desktop/Upload/ImportProject" -a "bankapi,yamlapi"
```

_See code: [src/commands/tcam/validate-apis.ts](https://github.com/TIBCOSoftware/cic-cli-plugin-tcam/blob/v1.0.2/src/commands/tcam/validate-apis.ts)_
