var DB_FIELDS = ['driver', 'host', 'port', 'database', 'username', 'password'];
module.exports = function (app) {
    var Sequelize = require('sequelize');

    /* Load Database Configuration */
    var db = require('../util').getEnvConf(DB_FIELDS, { prefix: 'DB_' });
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
            validate: { isUrl: true },
            allowNull: true,
        },
        Email: {
            type: Sequelize.STRING,
            validate: { isEmail: true }
        }
    });
    Model.app  = app;
    app.models = Model.models;
    return Model;
};

function extend(o, a) {
    Object.keys(a).forEach(function (k) { o[k] = a[k]; });
    return o;
}
function isValidDB(db) {
    return db && DB_FIELDS.every(function (x) { return db[x] !== undefined });
}
