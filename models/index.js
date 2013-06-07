module.exports = function (ORM) {
    var models = require("../util").loadSubmodules(__dirname);
    Object.keys(models).forEach(function (m) {
        models[m](ORM, ORM.types);
    });
    Object.keys(ORM.models).forEach(function (m) {
        ORM.models[m].init();
    });
    ORM.sequelize.sync().error(console.error);
    return models;
};
