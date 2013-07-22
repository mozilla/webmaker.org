#!/usr/bin/env node
orm = require('../lib/orm');
console.log('orm.models:', Object.keys(orm.models));
require('repl').start('> ');
