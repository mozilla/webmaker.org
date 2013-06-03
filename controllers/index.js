module.exports = function () {
    var cs = require("../util").loadSubmodules(__dirname);
    var app = this;
    Object.keys(cs).map(function (c) {
        cs[c] = cs[c](app);
        Object.keys(cs[c]).map(function (a) {
            cs[c][a] = cs[c][a].bind(cs[c]);
        });
    });
    return cs;
};
