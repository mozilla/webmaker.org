exports.init = function (app, nunjucksEnv, lessMiddleware, app_root) {
    var express  = require('express'),
        nunjucks = require('nunjucks'),
        markdown = require('markdown').markdown,
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
    nunjucksEnv.addFilter('markdown', markdown.toHTML.bind(markdown));

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
    ctx.orm = require('./config/orm').call(ctx);
    require('./models').call(ctx);
    require('./config/fixtures').call(ctx);

    util.shortcut(ctx, 'models', ctx.orm);

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
