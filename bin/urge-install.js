const urge = require('..');
const program = require('commander');
const Multispinner = require('multispinner');
const chalk = require('chalk');

program
    .option('-s, --save', 'Save installeds demiurge to urge.json');
program.parse(process.argv);
const urges = program.args;

function prettyInstall(spinners, demiurge) {
    const [user, repo] = demiurge.trim().split('/');
    urge.install(user, repo, program.save)
        .then(()  => spinners.success(demiurge))
        .catch(() => spinners.error(demiurge));
}

function installUrges(urges) {
    const spinners = new Multispinner(urges, {preText: 'Installing'});
    const spinningInstall = prettyInstall.bind(null, spinners);
    urges.forEach(spinningInstall);
    spinners.on('success', () => {
        console.log(chalk.green('Done without errors!'));
    });
    spinners.on('err', demiurge => console.log(chalk.red(`Demiurge '${demiurge}' encountered an error`)));
}

if (urges.length) {
    installUrges(urges);
} else {
    urge.fetch().then(installUrges);
}