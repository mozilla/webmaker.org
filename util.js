module.exports = {
    loadSubmodules: function (path, app) {
        var exp = {},
            fs = require('fs');
        fs.readdirSync(path).filter(function (f) {
            return f.match(/^[a-zA-Z]/)
                && !f.match(/^index\.js$/)
                && (fs.statSync(path+'/'+f).isFile() ? f.match(/\.js$/) : true);
        }).forEach(function (f) {
            try {
                exp[this.camelCase(f).replace(/\..*/, '')] = require(path+'/'+f);
            } catch (e) {}
        }, this);
        return exp;
    },
    camelCase:  function (x) {
        return x.toLowerCase().replace(/_(\w+)/g, function(m, m1) {
            return m1.charAt(0).toUpperCase() + m1.substr(1);
        }).replace(/\w+/g, function (m, m1) {
            return m.charAt(0).toUpperCase() + m.substr(1);
        });
    }
}
