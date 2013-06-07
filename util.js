module.exports = {
    loadSubmodules: function (path) {
        var exp = {},
            fs = require('fs');
        fs.readdirSync(path).filter(function (f) {
            return f.match(/^[a-zA-Z]/)
                && !f.match(/^index\.js$/)
                && (fs.statSync(path+'/'+f).isFile() ? f.match(/\.js$/) : true);
        }).forEach(function (f) {
            try {
                exp[this.camelize(f).replace(/\..*/, '')] = require(path+'/'+f);
            } catch (e) {}
        }, this);
        return exp;
    },
    camelize:  function (x) {
        return x.toLowerCase().replace(/_?([^\W_]+)/g, function(m, m1) {
            return m1.charAt(0).toUpperCase() + m1.substr(1);
        }).replace(/\w+/g, function (m, m1) {
            return m.charAt(0).toUpperCase() + m.substr(1);
        });
    },
    getEnvConf: function (fields, opts) {
        var prefix = opts.prefix || '', conf = {};
        return !fields.every(function (f) {
            db[f] = process.env[(prefix + f).toUpperCase()];
            return db[f] !== undefined;
        }) ? null : conf;
    }
}
