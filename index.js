exports.init = function (app, nunjucksEnv, lessMiddleware, app_root) {
    var express = require('express'),
        nunjucks = require('nunjucks'),
        here = __dirname,
        paths = {
            views:  here+'/views',
            static: here+'/static',
            less:   here+'/assets',
        };

    // Views
    nunjucksEnv.loaders.push(new nunjucks.FileSystemLoader(paths.views));

    // Assets
    var optimize = process.env.NODE_ENV === 'production';
    app.use(lessMiddleware({
        dest:     paths.static,
        src:      paths.less,
        paths:    [ app_root+'/public/css' ],

        once: optimize, debug: !optimize,
        compress: optimize, yuicompress: optimize,
        optimization: optimize * 2
    }));

    // Static
    app.use(express.static(paths.static));

    // Models
    var ORM = require('./config/orm').call(app, app);
    require('./models').call(app, ORM, app);
    ORM.sequelize.sync();

    // Controllers
    var Controllers = require('./controllers').call(app, app);
    process.nextTick(function () {
        require('./routes').call(app, Controllers, app);
    });

    return paths;
};
