#!/usr/bin/env node

const urge = require('..');
const ArgumentParser = require('argparse').ArgumentParser;

const parser = new ArgumentParser({
  version: '1.0.0',
  addHelp: true,
  description: 'A package manager for the demi language'
});

parser.addArgument(['-i', '--install'], {
    help: 'Name of package to install'
});

const args = parser.parseArgs();

if (!args.install) throw new Error('Please provide a valid package name (user/package)');

const [user, repo] = args.install.trim().split('/');

urge(user, repo).then(() => console.log('Done'));