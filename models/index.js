module.exports = function (orm) {
    var models = require("../util").loadSubmodules(__dirname);
    Object.keys(models).forEach(function (m) {
        models[m](orm, orm.types);
    });
    Object.keys(orm.models).forEach(function (m) {
        orm.models[m].init();
    });
    return models;
};
