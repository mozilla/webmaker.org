exports.init = function (app, nunjucksEnv, lessMiddleware, app_root) {
    var express  = require('express'),
        nunjucks = require('nunjucks'),
        util  = require('./util'),
        here  = __dirname,
        paths = {
            views:  here+'/views',
            static: here+'/static',
            assets: here+'/assets',
            root:   here,
        }, ctx = { dirs: paths, app: app };

    // Views
    nunjucksEnv.loaders.push(new nunjucks.FileSystemLoader(paths.views));
    nunjucksEnv.addFilter('json', JSON.stringify.bind(JSON));

    // Assets
    var optimize = process.env.NODE_ENV === 'production';
    app.use(lessMiddleware({
        dest:     paths.static,
        src:      paths.assets,
        paths:    [ app_root+'/public/css' ],

        once: optimize, debug: !optimize,
        compress: optimize, yuicompress: optimize,
        optimization: optimize * 2
    }));

    // Static
    app.use(express.static(paths.static));

    // Models
    ctx.orm = require('./config/orm').call(ctx, app);
    util.shortcut(ctx, 'models', ctx.orm);
    require('./models').call(ctx, ctx.orm);

    // S3 Client
    ctx.s3 = require('./config/s3').call(ctx, app);

    // Controllers
    ctx.controllers = require('./controllers').call(ctx, app);
    app.use(express.methodOverride());
    process.nextTick(require('./routes').bind(ctx, ctx.controllers, app));

    // Handy shortcuts
    util.shortcut(ctx, 'M', 'models');
    util.shortcut(ctx, 'C', 'controllers');

    return ctx;
};
