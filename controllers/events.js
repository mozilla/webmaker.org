var app   = 'events',
    model = 'event';
module.exports = function (app) {
    var Event = app.models.Event;

    return {
        index:  function(req, res)
        {
            Event.all().success(function (events) {
                resFmt(req, res, {
                    json: function () {
                        res.send(200, { events: events });
                    },
                    html: function () {
                        render_page(req, res, 'map', { events: events });
                    }
                })
            });
        },
        create: function(req, res)
        {
            var event = req.body.event;
            if (event) {
                [ 'begin', 'end' ].map(function (f) {
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
            }
            Event.create(event).success(function (event) {
                reply(req, res, 200, 'Event created', { event: event });
            }).error(function (err) {
                reply(req, res, 500, 'Could not create Event', { error: err });
            });
        },
        details: function(req, res)
        {
            Event.find(req.params.id).success(function (event) {
                resFmt(req, res, {
                    json: function () { res.send(200, event) },
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
                            default:
                                evt[p] = event[p];
                        }
                        render_page(req, res, 'details', { event: evt });
                    }
                });
            }).error(function (err) {
                reply(req, res, 404, 'Event not found');
            });
        },
        update: function(req, res)
        {
            Event.find(req.params.id).success(function (event) {
                event.updateAttributes(req.params.id).success(function () {
                    reply(req, res, 200, 'Event updated', { event: event });
                });
            }).error(function (err) {
                reply(req, res, 404, 'Event not found');
            });
        },
        destroy: function(req, res)
        {
            Event.find(req.params.id).success(function (event) {
                event.destroy().success(function () {
                    reply(req, res, 200, 'Event deleted');
                });
            }).error(function (err) {
                reply(req, res, 404, 'Event not found');
            });
        }
    };
};

function resFmt(req, res, fmts) {
    // Optional Content-Type override via 'format' query-parameter.
    var fmt = req.param('format');
    if (fmt && fmts[fmt])
        return fmts[fmt]();
    return res.format(fmts);
};
function render_page(req, res, page, data) {
    data.page   = app;  // legacy from Webmaker layout
    data.view   = page;

    data.makeEndpoint = process.env.MAKE_ENDPOINT;
    data.personaSSO   = process.env.AUDIENCE;
    data.loginAPI     = process.env.LOGIN;
    data.email        = req.session.email || '';
    data.webmakerID   = req.session.webmakerid || '';

    data.css = css;
    res.render('events/'+page+'.html', data);
};
function reply(req, res, code, msg, obj) {
    var isError = code >= 400;
    resFmt(req, res, {
        json: function () {
            if (!obj) obj = isError ? { error: msg } : { msg: msg };
            res.send(code, obj);
        },
        html: function () {
            res.redirect('/'+app+(obj && obj[model] ? '/'+obj[model].id : ''));
        },
    });
};
