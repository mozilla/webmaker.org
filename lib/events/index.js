exports.init = function (app, nunjucksEnv, app_root) {
    var express  = require('express'),
        nunjucks = require('nunjucks'),
        markdown = require('markdown').markdown,
        util  = require('./util'),
        here  = app_root,
        paths = {
            views:  here+ '/views/events',
            static: here+'/public/events',
            root:   here,
        }, ctx = { dirs: paths, app: app };

    // Views
    nunjucksEnv.addFilter('json', JSON.stringify.bind(JSON));
    nunjucksEnv.addFilter('markdown', function(text) {
        return markdown.toHTML(text || '');
    });
    nunjucksEnv.addFilter('intcomma', function(val) {
        var oldStr = val.toString(), newStr = oldStr;

        do {
            [newStr, oldStr] = [newStr.replace(/^(-?\d+)(\d{3})/, '$1,$2'), newStr];
        } while (newStr != oldStr);

        return newStr;
    });

    // Static
    app.use(express.static(paths.static));

    // Models
    ctx.orm = require('./lib/orm');

    if (!require('./lib/fixtures').call(ctx))
        ctx.orm.sequelize.sync().error(console.error.bind(console));

    util.shortcut(ctx, 'models', ctx.orm);

    // S3 Client
    ctx.s3 = require('./lib/s3').call(ctx, app);

    // LoginAPI
    process.nextTick(function() {
        ctx.loginAPI = require(here+'/lib/loginapi');
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
