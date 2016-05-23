const urge = require('..');
const program = require('commander');
const chalk = require('chalk');

program.parse(process.argv);
const urges = program.args;

if (urges.length !== 1) {
    console.log(chalk.red('Exactly 1 demiurge name must be provided'));
    process.exit(1);
}

const name = urges[0];
console.log(chalk.blue(`Uninstalling demiurge '${name}'`));
urge.uninstall(name).then(() => console.log(chalk.green(`Uninstalled demiurge '${name}'`)))