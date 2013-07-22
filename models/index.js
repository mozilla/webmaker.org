module.exports = function (orm) {
    orm = orm || this.orm;
    var models = require("../util").loadSubmodules(__dirname);
    Object.keys(models).forEach(function (m) {
        models[m](orm, orm.types);
    }, this);
    Object.keys(orm.models).forEach(function (m) {
        orm.models[m].init();
    }, this);
    return models;
};
