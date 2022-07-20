#!/usr/bin/env node

const { magenta, yellow, green, red } = require('chalk');
const program = require('commander');
const path = require('path');

const packageInfo = require('./package.json');
const codegen = require('./lib/codegen');

let swaggerFile;

const parseOutput = dir => path.resolve(dir);

program
  .version(packageInfo.version)
  .arguments('<swaggerFile>')
  .action((swaggerFilePath) => {
    swaggerFile = path.resolve(swaggerFilePath);
  })
  .option('-b, --handlebars <helperFilePath>', 'path to external handlebars helpers file (defaults to empty)', parseOutput)
  .option('-o, --output <outputDir>', 'directory where to put the generated files (defaults to current directory)', parseOutput, process.cwd())
  .option('-t, --templates <templateDir>', 'directory where templates are located (defaults to internal nodejs templates)')
  .parse(process.argv);

if (!swaggerFile) {
  console.error(red('> Path to Swagger file not provided.'));
  program.help(); // This exits the process
}

codegen.generate({
  swagger: swaggerFile,
  target_dir: program.output,
  templates: program.templates ? path.resolve(process.cwd(), program.templates) : undefined,
  handlebars_helper: program.handlebars ? path.resolve(process.cwd(), program.handlebars) : undefined
}).then(() => {
  console.log(green('Done! ✨'));
  console.log(yellow('Check out your shiny new API at ') + magenta(program.output) + yellow('.'));
}).catch(err => {
  console.error(red('Aaww 💩. Something went wrong:'));
  console.error(red(err.stack || err.message));
});

process.on('unhandledRejection', (err) => console.error(err));
