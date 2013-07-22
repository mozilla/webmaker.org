#!/usr/bin/env node
orm = require('../config/orm')();
var models = require('../models')(orm);
console.log('orm.models:', Object.keys(models));
var repl = require('repl');
repl.start('> ');
