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
    nunjucksEnv.addFilter('markdown', function(text) {
        return markdown.toHTML(text || '');
    });
    nunjucksEnv.addFilter('intcomma', function(val) {
        var oldStr = val.toString(), newStr;
        while (oldStr != newStr) {
            newStr = oldStr.replace(/^(-?\d+)(\d{3})/, '$1,$2');
            oldStr = newStr;
        }
        return newStr;
    });

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

    if (!require('./config/fixtures').call(ctx))
        ctx.orm.sequelize.sync().error(console.error.bind(console));

    util.shortcut(ctx, 'models', ctx.orm);

    // S3 Client
    ctx.s3 = require('./config/s3').call(ctx, app);

    // LoginAPI
    process.nextTick(function() {
        ctx.loginAPI = require(app_root+'/lib/loginapi');
    });

    // Controllers
    ctx.controllers = require('./controllers').call(ctx, app);
    app.use(express.methodOverride());
    process.nextTick(require('./routes').bind(ctx, ctx.controllers, app));

    // Handy shortcuts
    util.shortcut(ctx, 'M', 'models');
    util.shortcut(ctx, 'C', 'controllers');

    return ctx;
};
