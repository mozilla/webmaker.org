module.exports = function () {
    var Sequelize = require('sequelize'), db;

    /* Load Database Configuration */
    try { db = require('./databases')[this.get('env')]; } catch (e) {}
    if (!db) db = this.get('database');
    if (!db) throw new Error("Database configuration not found.");

    /* Connect to Database Server */
    var Model; Model = function(name, fields, init) {
        var model = Model.models[name] = Model.sequelize.define(name, fields);
        init = init || function(){};
        model.init = function () {
            init.call(model, Model.models);
        };
        model.init.bind(model);
        return model;
    };
    Model.sequelize = new Sequelize(db.database, db.username, db.password,
                                    { host: db.host, port: db.port });
    Model.models    = {};
    Model.types     = extend(Object.create(Sequelize), {
        String: Sequelize.STRING,
        Text:   Sequelize.TEXT,
        Float:  Sequelize.FLOAT,
        Int:    Sequelize.INTEGER,
        Date:   Sequelize.DATE,
        URL: {
            type: Sequelize.STRING,
            validate: { isUrl: true }
        },
        Email: {
            type: Sequelize.STRING,
            validate: { isEmail: true }
        }
    });
    Model.app  = this;
    this.models = Model.models;
    return Model;
};

function extend(o, a) {
    Object.keys(a).forEach(function (k) { o[k] = a[k]; });
    return o;
}
