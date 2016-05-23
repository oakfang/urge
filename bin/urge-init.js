const readline = require('readline');

const urge = require('..');
const chalk = require('chalk');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question(chalk.blue('What is your demiurge\'s name? '), name => {
    urge.init(name).then(() => {
        console.log(chalk.green('All done!'));
        rl.close();
    });
});