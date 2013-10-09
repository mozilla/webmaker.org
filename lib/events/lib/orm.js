var Habitat = require('habitat'),
    config = new Habitat();

var Sequelize = require('sequelize'),
    util = require('../util');

/* Connect to Database Server */
var ORM = function(name, fields, init) {
    var config = {};
    Object.keys(fields)
        .filter(function (f) { return f.match(/^\$/) })
        .forEach(function (f) {
            config[f.replace(/^\$/, '')] = fields[f];
            delete fields[f];
        });
    var model = ORM.models[name] = ORM.sequelize.define(name, fields, config);
    init = init || function(){};
    model.init = function () {
        init.call(model, ORM.models);
    }.bind(model);
    model.fields = Object.keys(fields)
                         .filter(function (f) { return !f.match(/^\$/) });
    return model;
};
function make_types(typedefs) {
    var types = {};
    Object.keys(typedefs).forEach(function (t) {
        var type = typedefs[t].type;
        types[t] = util.autoconfig(typedefs[t])({ toString: type.toString.bind(type) });
        util.defProp(types[t], 'type', { get: function () { return this.toString() } });
    });
    return util.extend(Sequelize, types);
}

if (config.get('CLEARDB_DATABASE_URL')) {
  ORM.sequelize = new Sequelize(config.get('CLEARDB_DATABASE_URL'));
} else {
  var db = config.get('DB');
  ORM.sequelize = new Sequelize(db.database, db.username, db.password,
                                  { host: db.host, port: db.port, dialect: db.dialect,
                                    storage: db.storage });
}

ORM.models    = {};
ORM.types     = make_types({
    String: { type: Sequelize.STRING  },
    Text:   {
        type:       Sequelize.TEXT,
        allowNull:  false,
        defaultValue: ''
    },
    Int:    { type: Sequelize.INTEGER },
    Float:  { type: Sequelize.FLOAT   },
    Date:   {
        type:       Sequelize.DATE,
        allowNull:  true,
        defaultValue: null
    },
    URL:    {
        type:       Sequelize.STRING,
        validate:   { isUrl: true },
        allowNull:  true,
        defaultValue: null
    },
    Email:  {
        type:       Sequelize.STRING,
        validate:   { isEmail: true }
    }
});
require('../models')(ORM);
module.exports = ORM;
