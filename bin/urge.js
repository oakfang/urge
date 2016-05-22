#!/usr/bin/env node

const urge = require('..');
const ArgumentParser = require('argparse').ArgumentParser;

const parser = new ArgumentParser({
  version: '1.0.0',
  addHelp: true,
  description: 'A package manager for the demi language'
});

parser.addArgument(['-i', '--install'], {
    help: 'Name of demiurge to install'
});

parser.addArgument(['-s', '--save'], {
    help: 'Save installed demiurge to urge.json',
    action: 'storeTrue'
});

parser.addArgument(['-n', '--init'], {
    help: 'Start a new demiurge'
});

parser.addArgument(['-f', '--fetch'], {
    help: 'Fetch all dependecies in urge.json',
    action: 'storeTrue'
});

const args = parser.parseArgs();

if (args.init) {
    urge.init(args.init);
} else if (args.install) {
    const [user, repo] = args.install.trim().split('/');
    urge.install(user, repo, args.save);
} else if (args.fetch) {
    urge.fetch();
} else {
    throw new Error('No action provided');
}