var util = require("../util"),
    csv  = require('csv');
module.exports = function (app) {
    var cs = util.loadSubmodules(__dirname);
    Object.keys(cs).map(function (c) {
        cs[c] = cs[c].call(this, exports.initMiddleware.bind(this, app));
        Object.keys(cs[c]).map(function (a) {
            cs[c][a] = cs[c][a].bind(this);
        }, this);
    }, this);
    return cs;
};
exports.initMiddleware = function(app, app_name, model_name)
{
    app.use('/'+app_name, function (req, res, next) {

        // Optional Content-Type selection via '_format' query-parameter.
        var format = res.format.bind(res);
        res.format = function(fmts)
        {
            var fmt = req.param('_format');
            util.objMap(fmts, function(v, k) {
                if (v instanceof Array)
                    fmts[k] = function() { res.reply.apply(res, v) }
            });
            return (fmt && fmts[fmt]) ? fmts[fmt]() : format(fmts);
        };

        res.reply = function(code, msg, obj, headers)
        {
            if (!obj && typeof msg !== "string") {  // handle 2-arg case
                obj = msg;
                delete msg;
            }
            if (typeof code === "string") {
                var page = code;      // code is actually a view-name
                obj = obj || {};
                obj.page = app_name;  // legacy naming from Webmaker layout
                obj.view = page;
                return res.render(app_name+'/'+page+'.html', obj);
            }
            var isError = code >= 400;
            if (isError) console.error(arguments);

            headers = headers || {};
            util.objMap(headers, function (v, k) { res.setHeader(k, v) });

            res.format({
                json: function () {
                    if (!obj) obj = isError ? { error: msg } : { msg: msg };
                    res.send(code, obj);
                },
                csv: function () {
                    if (isError)
                        return res.send(code, msg);

                    res.setHeader('Content-type', 'text/csv');
                    // Uncomment for 'save-as' vs embedded viewer
                    // res.setHeader('Content-Disposition', 'attachment;filename="events.csv"');

                    csv().from(obj).to.stream(res);
                },
                html: function () {
                    var id = obj && obj[model_name] && obj[model_name].id;
                    res.redirect('/'+app_name + (id ? '/'+id : ''));
                },
            });
        };
        next();
    });
};
