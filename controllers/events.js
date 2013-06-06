module.exports = function (app) {
    setupMiddleware(app);

    var Event = app.models.Event,
        markdown = require('markdown').markdown;

    return {
        index:  function(req, res)
        {
            Event.all().success(function (events) {
                res.format({
                    json: function () {
                        res.reply(200, { events: events });
                    },
                    html: function () {
                        res.reply('map', { events: events });
                    }
                })
            });
        },
        create: function(req, res)
        {
            var event = req.body.event;
            if (!event)
                return res.reply(400, 'No Event provided');
            ['begin', 'end'].map(function (f) {
                var df = f + 'Date';
                event[df] = event[df] ? new Date(event[df].split('-')) : null;
                if (event[df] == "Invalid Date")
                    event[df] = null;

                var tf = f + 'Time';
                var ts = event[tf].split(':');
                event[tf] = event[tf] ? new Date(0,0,0,ts[0],ts[1]) : null;
                if (event[tf] == "Invalid Date")
                    event[tf] = null;
            });
            ['registerLink', 'picture'].forEach(function (f) {
                if (!event[f]) event[f] = null;
            });
            if (!(event.organizer = req.session.email))
                return res.reply(401, 'Log in to create Events');
            event.organizerId = req.session.webmakerID;
            Event.create(event).success(function (event) {
                res.reply(200, 'Event created', { event: event });
            }).error(function (err) {
                res.reply(400, 'Invalid Event provided', { error: err });
            });
        },
        details: function(req, res)
        {
            Event.find(req.params.id).success(function (event) {
                res.format({
                    json: function () { res.reply(200, { event: event }) },
                    html: function () {
                        function fmtDate(x) { return new Date(x).toDateString() }
                        function fmtTime(x) { return new Date(x).toTimeString().split(' ')[0] }

                        var evt = {};
                        for (var p in event) switch(p) {
                            case 'beginDate':
                            case 'endDate':
                                evt[p] = fmtDate(event[p]);
                                break;
                            case 'beginTime':
                            case 'endTime':
                                evt[p] = fmtTime(event[p]);
                                break;
                            case 'description':
                                evt[p] = markdown.toHTML(event[p]);
                            default:
                                evt[p] = event[p];
                        }
                        res.reply('details', { event: evt });
                    }
                });
            }).error(function (err) {
                res.reply(404, 'Event not found');
            });
        },
        update: function(req, res)
        {
            Event.find(req.params.id).success(function (event) {
                event.updateAttributes(req.params.id).success(function () {
                    res.reply(200, 'Event updated', { event: event });
                });
            }).error(function (err) {
                res.reply(404, 'Event not found');
            });
        },
        destroy: function(req, res)
        {
            Event.find(req.params.id).success(function (event) {
                event.destroy().success(function () {
                    res.reply(200, 'Event deleted');
                });
            }).error(function (err) {
                res.reply(404, 'Event not found');
            });
        }
    };
};
function setupMiddleware(app) {
    var app_name   = 'events',
        model_name = 'event';

    app.use('/'+app_name, function (req, res, next) {
        // Optional Content-Type override via 'format' query-parameter.
        var format = res.format.bind(res);
        res.format = function(fmts)
        {
            var fmt = req.param('format');
            return (fmt && fmts[fmt]) ? fmts[fmt]() : format(fmts);
        };
        res.reply = function(code, msg, obj)
        {
            if (!obj && typeof msg !== "string") {  // handle 2-arg case
                obj = msg;
                delete msg;
            }
            if (typeof code === "string") { // code is actually a view-name
                var page = code;
                obj = obj || {};
                obj.page = app_name;  // legacy naming from Webmaker layout
                obj.view = page;
                // TODO: move into main app's middleware
                res.locals({
                    makeEndpoint : process.env.MAKE_ENDPOINT,
                    personaSSO   : process.env.AUDIENCE,
                    loginAPI     : process.env.LOGIN,
                    email        : req.session.email || '',
                    webmakerID   : req.session.webmakerid || ''
                });
                return res.render(app_name+'/'+page+'.html', obj);
            }
            var isError = code >= 400;
            res.format({
                json: function () {
                    if (!obj) obj = isError ? { error: msg } : { msg: msg };
                    res.send(code, obj);
                },
                html: function () {
                    var id = obj && obj[model_name] && obj[model_name].id;
                    res.redirect('/'+app_name + id ? '/'+id : '');
                },
            });
        };
        next();
    });
}
