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
            var event = req.body.event || req.body;
            console.log(event);

            var fields = {  // undefined fields are required
                title:          undefined,
                description:    undefined,
                address:        undefined,
                organizer:      undefined,
                latitude:       null,
                longitude:      null,
                attendees:      3,
                beginDate:      null,
                endDate:        null,
                beginTime:      null,
                endTime:        null,
                registerLink:   null
            };
            var required = [ 'title', 'description', 'latitude', 'longitude', 'address' ];

            if (!(event.organizer = req.session.email))
                return res.reply(401, 'Log in to create Events');
            if (event.picture) {
                var match = event.picture.match(/^data:(image\/[\w+-]+);.*?base64,(.*)/);
                event.picture = match ? {
                    type: match[1],
                    data: new Buffer(match[2], 'base64')
                } : null
            }
            // pre-process the Date/Time fields
            ['begin', 'end'].forEach(function (pfx) {
                datetime_transform('Date', function (val) {
                    return new Date(val.split('-'));
                });
                datetime_transform('Time', function (val) {
                    var ts = val.split(':');
                    return new Date(0, 0, 0, ts[0], ts[1]);
                });
                function datetime_transform(f, transform) {
                    var dtf = pfx + f;
                    event[dtf] = (function(event) {
                        if (!event[dtf]) return null;
                        var new_time = transform(event[dtf]);
                        return new_time != "Invalid Date" ? new_time : null;
                    })(event)
                }
            });
            function empty(x) { return x === '' || x === undefined }
            var trns_event = {};
            Object.keys(fields).forEach(function (f) {
                trns_event[f] = empty(event[f]) ? fields[f] : event[f];
            });
            if (!required.every(function (f) { return !empty(trns_event[f]) }))
                return res.reply(400, 'Invalid Event provided');

            var picture = event.picture;
            Event.create(trns_event, Object.keys(fields)).success(function (event) {
                if (picture) {
                    var s3_req = s3_client.put(uuid.v4(), {
                        'Content-Length':   picture.data.length,
                        'Content-Type':     picture.type,
                        'x-amz-acl':        'public-read'
                    });
                    s3_req.on('response', function(s3_res) {
                        if (s3_res.statusCode === 200) {
                            event.picture = s3_req.url;
                            event.save(['picture']);
                        }
                    });
                    s3_req.end(picture.data);
                }
                res.reply(200, 'Event created', { event: event });
            }).error(function (err) {
                res.reply(400, 'Invalid Event provided', { error: err });
            });
        },
        details: function(req, res)
        {
            Event.find(req.params.id).success(function (event) {
                if (!event) return res.reply(404, 'Event not found');
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
