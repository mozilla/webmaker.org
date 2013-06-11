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
    var s3 = this.s3;

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
            var event = event_input_filter(req.body.event || req.body);
            if (!event)
                return res.reply(400, 'Invalid Event provided');

            if (!(event.organizer = req.session.email))
                return res.reply(401, 'Log in to create Events');
            event.organizerId = req.session.username;

            var picture = event.picture;
            delete event.picture;

            var fields = ['title', 'description', 'address', 'latitude',
                'longitude', 'attendees', 'beginDate', 'endDate', 'beginTime',
                'endTime', 'registerLink', 'organizer', 'organizerId'];
            Event.create(event, fields).success(function (event) {
                if (picture) {
                    var filename = uuid.v4();
                    var s3_req = s3.client.put(filename, {
                        'Content-Length':   picture.data.length,
                        'Content-Type':     picture.type,
                        'x-amz-acl':        'public-read'
                    });
                    s3_req.on('response', function(s3_res) {
                        if (s3_res.statusCode === 200)
                            event.updateAttributes({
                                picture: s3.url(filename)
                            });
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
            fetch_event(req, function (event) {
                res.format({
                    json: function () { res.reply(200, { event: event }) },
                    html: function () {
                        res.reply('details', { event: event_output_filter(event) });
                    }
                });
            });
        },
        change: function(req, res)
        {
            var changes = event_input_filter(req.body.event || req.body, false, true, false);
            if (!changes)
                return res.reply(400, 'Invalid Event changes requested');
            var allowed = [ 'title', 'description', 'address', 'latitude',
                    'longitude', 'attendees', 'beginDate', 'endDate',
                    'beginTime', 'endTime', 'registerLink' ];

            Object.keys(changes).forEach(function (k) {
                if (empty(changes[k]))
                    delete changes[k];
            });
            var picture = changes.picture;
            fetch_event(req, function (event) {
                event.updateAttributes(changes, allowed).success(function () {
                    if (picture) {
                        var filename = uuid.v4();
                        var s3_req = s3.client.put(filename, {
                            'Content-Length':   picture.data.length,
                            'Content-Type':     picture.type,
                            'x-amz-acl':        'public-read'
                        });
                        s3_req.on('response', function(s3_res) {
                            if (s3_res.statusCode === 200)
                                s3.delete(event.picture);
                                event.updateAttributes({
                                    picture: s3.url(filename)
                                });
                        });
                        s3_req.end(picture.data);
                    }
                    res.reply(200, 'Event modified', { event: event });
                });
            });
        },
        destroy: function(req, res)
        {
            Event.find(req.params.id).success(function (event) {
                var picture = event.picture;
                event.destroy().success(function () {
                    if (picture)
                        s3.delete(picture);
                    res.reply(200, 'Event deleted');
                });
            }).error(function (err) {
                res.reply(404, 'Event not found');
            });
        }
    };

    function empty(x) { return x === '' || x === undefined }
    function event_input_filter(event, set_defaults, do_transforms, check_required) {
        if (!event) return null;

        set_defaults = set_defaults === undefined ? true : set_defaults;
        do_transforms = do_transforms === undefined ? true : do_transforms;
        check_required = check_required === undefined ? true : check_required;

        var fields = {  // undefined fields are required
            title:          undefined,
            description:    undefined,
            address:        undefined,
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

        var transforms = {
            picture: function (event) {
                if (!event.picture) return;
                var match = event.picture.match(/^data:(image\/[\w+-]+);.*?base64,(.*)/);
                return match ? {
                    type: match[1],
                    data: new Buffer(match[2], 'base64')
                } : undefined
            }
        };
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
                transforms[dtf] = function(event) {
                    if (!event[dtf]) return;
                    var new_time = transform(event[dtf]);
                    if (new_time != "Invalid Date")
                        return new_time;
                };
            }
        });
        var evt = {};
        if (do_transforms)
            Object.keys(transforms).forEach(function (f) {
                evt[f] = transforms[f](event);
            });
        Object.keys(fields).forEach(function (f) {
            if (!(f in evt)) evt[f] = event[f];
        });
        if (set_defaults)
            Object.keys(fields).forEach(function (f) {
                evt[f] = empty(event[f]) ? fields[f] : event[f];
            });
        if (check_required)
            evt = required.every(function (f) { return !empty(evt[f]) }) ? evt : null;
        return evt
    }
    function event_output_filter(event) {
        function fmtDate(x) { return new Date(x).toDateString() }
        function fmtTime(x) { return new Date(x).toTimeString().split(' ')[0] }

        var evt = {};
        for (var p in event) switch(p) {
            case 'beginDate':
            case 'endDate':
                if (event[p])
                    evt[p] = fmtDate(event[p]);
                break;
            case 'beginTime':
            case 'endTime':
                if (event[p])
                    evt[p] = fmtTime(event[p]);
                break;
            case 'description':
                evt[p] = markdown.toHTML(event[p]);
                break;
            default:
                evt[p] = event[p];
        }
        return evt;
    }
    function fetch_event(req, success) {
        return Event.find(req.params.id).success(function (event) {
            if (!event) return req.res.reply(404, 'Event not found');
            success(event);
        }).error(function (err) {
            req.res.reply(404, 'Event not found');
        });
    }
};
