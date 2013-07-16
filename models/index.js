module.exports = function () {
    var models = require("../util").loadSubmodules(__dirname);
    Object.keys(models).forEach(function (m) {
        models[m](this.orm, this.orm.types);
    }, this);
    Object.keys(this.orm.models).forEach(function (m) {
        this.orm.models[m].init();
    }, this);
    //this.orm.sequelize.drop().error(console.error.bind(console));
    this.orm.sequelize.sync().error(console.error.bind(console));
    return models;
};
