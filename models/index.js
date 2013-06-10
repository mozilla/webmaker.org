module.exports = function (ORM) {
    var models = require("../util").loadSubmodules(__dirname);
    Object.keys(models).forEach(function (m) {
        models[m](ORM, ORM.types);
    });
    Object.keys(ORM.models).forEach(function (m) {
        ORM.models[m].init();
    });
    //ORM.sequelize.drop().error(console.error.bind(console));
    ORM.sequelize.sync().error(console.error.bind(console));
    return models;
};
