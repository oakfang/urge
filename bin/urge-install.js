const urge = require('..');
const program = require('commander');
const Multispinner = require('multispinner');
const chalk = require('chalk');

let errors = {};

program
    .option('-s, --save', 'Save installeds demiurge to urge.json');
program.parse(process.argv);
const urges = program.args;

function prettyInstall(spinners, demiurge) {
    const [details, branch] = demiurge.trim().split('@');
    const [user, repo] = details.split('/');
    urge.install(user, repo, branch, program.save)
        .then(()  => spinners.success(demiurge))
        .catch(error => {
            errors[demiurge] = error;
            spinners.error(demiurge);
        });
}

function installUrges(urges) {
    const spinners = new Multispinner(urges, {preText: 'Installing'});
    const spinningInstall = prettyInstall.bind(null, spinners);
    urges.forEach(spinningInstall);
    spinners.on('success', () => {
        console.log(chalk.green('Done without errors!'));
    });
    spinners.on('err', demiurge => console.log(chalk.red(`Demiurge '${demiurge}' encountered an error: ${errors[demiurge]}`)));
}

if (urges.length) {
    installUrges(urges);
} else {
    urge.fetch().then(deps => installUrges(Object.keys(deps).map(dep => {
        let urge = deps[deps];
        return `${urge.user}/${urge.repo}@${urge.version}`;
    })));
}