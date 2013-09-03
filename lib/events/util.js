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
    hasFields: function (o, fields) {
        return o && fields.every(function (f) { return o[f] !== undefined });
    },
    getEnvConfig: function (fields, opts) {
        var prefix = opts.prefix || '', conf = {};
        fields.forEach(function (f) {
            conf[f] = process.env[(prefix + f).toUpperCase()];
        });
        return conf
    },
    defProp:    Object.defineProperty.bind(Object),
    getOwnProp: Object.getOwnPropertyDescriptor.bind(Object),
    clone:      Object.create.bind(Object),
    extend: function(obj, extra) {
        var clone = this.clone(obj);
        for (var k in extra)
            if (extra.hasOwnProperty(k))
                this.defProp(clone, k, this.getOwnProp(extra, k));
            else
                clone[k] = extra[k];
        return clone;
    },
    shortcut: function(obj, key, other, other_key) {
        if (typeof other === 'string') {    // in-place shortcut
            other_key = other;
            other = obj;
        }
        other_key = other_key || key;
        Object.defineProperty(obj, key, { get: function() { return other[key] }});
    },
    autoconfig: function (defs) {
        var extend     = this.extend.bind(this),
            autoconfig = this.autoconfig.bind(this);

        function conf(opts) {
            return autoconfig(extend(conf, opts));
        }
        conf.__proto__ = extend(conf.__proto__, defs);
        return conf;
    },
    objMap: function (old, mapper) {
        var obj = {};
        Object.keys(old).forEach(function(f) {
            obj[f] = mapper(old[f], f);
        });
        return obj;
    },
    objFilter: function (old, filter) {
        var obj = {};
        Object.keys(old).filter(function(f) { return filter(old[f], f) })
                        .forEach(function(f) { obj[f] = old[f] });
        return obj;
    },
    sans: function (A, B) {
        return A.filter(function(x) { return B.indexOf(x) < 0 });
    },
    ifndef: function(x, d) {
        return x === undefined ? d : x
    }
}
