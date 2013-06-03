exports.init = function (app, nunjucksEnv) {
    var express = require('express');
    // Static + Assets
    app.use(express.static(__dirname+'/static'));
    app.use(require('connect-assets')({
        src:        __dirname+'/assets',
        buildDir:   'public/_cache'
    }));

    // Views
    var nunjucks = require('nunjucks');
    var nunjucksLoader = new nunjucks.FileSystemLoader(__dirname+'/views');
    if (!nunjucksEnv)
        nunjucksEnv = new nunjucks.Environment(nunjucksLoader);
    nunjucksEnv.loaders.push(nunjucksLoader);

    // Models
    var ORM = require('./config/orm').call(app, app);
    require('./models').call(app, ORM, app);
    ORM.sequelize.sync();

    // Controllers
    var Controllers = require('./controllers').call(app, app);
    process.nextTick(function () {
        require('./routes').call(app, Controllers, app);
    });
};
