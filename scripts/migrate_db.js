#!/usr/bin/env node

var orm = require('../config/orm').call();
var migrator = orm.sequelize.getMigrator({ path: './migrations' });
migrator.migrate();
