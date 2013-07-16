#!/usr/bin/env node

var here = __dirname;
var orm = require(here + '/../config/orm').call();
orm.sequelize.sync().error(console.error.bind(console))
                    .success(function () {
    var migrator = orm.sequelize.getMigrator({ path: here + '/../migrations' });
    migrator.migrate();
});
