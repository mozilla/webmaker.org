module.exports = function (init) {
    init('events', 'event');

    var Event = this.models.Event,
        util  = require('../util'),
        uuid  = require('uuid'),
        fs    = require('fs'),
        express  = require('express'),
        markdown = require('markdown').markdown;

    // Limit upload filesize
    //this.app.use('/events', express.limit('10M'));
    var s3_client = this.s3.client;

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
            var event = util.clone(req.body);

            // pre-process the Date/Time fields
            ['begin', 'end'].forEach(function (f) {
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
            // set blank as null
            ['registerLink'].forEach(function (f) {
                if (!event[f]) event[f] = null;
            });
            event.picture = null;

            if (!(event.organizer = req.session.email))
                return res.reply(401, 'Log in to create Events');

            Event.create(event).success(function (event) {
                if (req.files && req.files.picture
                              && req.files.picture.size > 0) {
                    var picture = req.files.picture;
                    fs.readFile(picture.path, function(err, data) {
                        if (err) {
                            return res.reply(500, 'Could not read uploaded file.', { error: err });
                        } else {
                            var s3_req = s3_client.put(uuid.v4(), {
                                'Content-Length':   data.length,
                                'Content-Type':     picture.type,
                                'x-amz-acl':        'public-read'
                            });
                            s3_req.on('response', function(s3_res) {
                                if (s3_res.statusCode === 200) {
                                    console.log(s3_req.url);
                                    event.url = s3_req.url;
                                    event.save(['url']);
                                }
                            });
                            s3_req.end(data);
                        }
                    });
                }
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
