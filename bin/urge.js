#!/usr/bin/env node

const urge = require('..');
const program = require('commander');

program
    .version('1.0.2')
    .command('init', 'Start a new demiurge in the current directory')
    .command('install [repos...]', 'Install demiurges from one or more demiurges, or fetch all dependencies')
    .command('uninstall <demiurge>', 'Uninstall a currently installed demiurge');

program.parse(process.argv);