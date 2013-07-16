module.exports = function (init) {
    init('events', 'event');

    var Event = this.models.Event,
        util  = require('../util'),
        csv   = require('csv'),
        fs    = require('fs'),
        crypto   = require('crypto'),
        express  = require('express'),
        markdown = require('markdown').markdown;

    var md5 = function (data) {
        return crypto.createHash('md5').update(data).digest("hex");
    }

    // Limit upload filesize
    //this.app.use('/events', express.limit('10M'));
    var s3 = this.s3;

    return {
        index:  function(req, res)
        {
            Event.all().success(function (events) {
                res.format({
                    json: function () {
                        res.reply(200, { events: events.map(event_output_filter) });
                    },
                    html: function () {
                        res.reply('map', { events: events.map(event_output_filter) });
                    },
                    csv:  function () {
                        var columns = [ 'id', 'beginDate', 'endDate', 'beginTime', 'endTime',
                            'title', 'description', 'address', 'latitude', 'longitude',
                            'attendees', 'registerLink', 'picture', 'organizerId' ];
                        res.setHeader('Content-type', 'text/csv');
                        // Uncomment for 'save-as' vs embedded viewer
                        // res.setHeader('Content-Disposition', 'attachment;filename="events.csv"');
                        var source_array = events.map(event_output_filter).map(function (event) {
                            return columns.map(function (c) { return event[c] })
                        });
                        source_array.unshift(columns);
                        csv().from.array(source_array).to.stream(res);
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
            if (!(event.organizerId = req.session.username))
                return res.reply(403, 'Create an account first');

            var picture = event.picture;
            delete event.picture;

            var fields = ['title', 'description', 'address', 'latitude',
                'longitude', 'attendees', 'beginDate', 'endDate', 'beginTime',
                'endTime', 'registerLink', 'organizer', 'organizerId'];
            Event.create(event, fields).success(function (event) {
                if (picture)
                    s3.put(picture.data, picture.type, function (filename) {
                        event.updateAttributes({
                            picture: s3.url(filename)
                        }).success(function (event) {
                            res.reply(200, 'Event created',
                                { event: event_output_filter(event) });
                        });
                    });
                else res.reply(200, 'Event created', { event: event_output_filter(event) });
            }).error(function (err) {
                res.reply(400, 'Invalid Event provided', { error: err });
            });
        },
        details: function(req, res)
        {
            fetch_event(req, function (event) {
                res.format({
                    json: function () { res.reply(200, { event: event_output_filter(event) }) },
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
                if (blank(changes[k]))
                    delete changes[k];
            });
            var picture = changes.picture;
            delete changes.picture;
            fetch_event(req, function (event) {
                event.updateAttributes(changes, allowed).success(function (event) {
                    if (picture)
                        s3.put(picture.data, picture.type, function (filename) {
                            if (event.picture)
                                s3.delete(event.picture);
                            event.updateAttributes({
                                picture: s3.url(filename)
                            });
                        });
                    res.reply(200, 'Event modified', { event: event_output_filter(event) });
                });
            }, true);
        },
        destroy: function(req, res)
        {
            fetch_event(req, function (event) {
                var picture = event.picture;
                event.destroy().success(function () {
                    if (picture)
                        s3.delete(picture);
                    res.reply(200, 'Event deleted');
                });
            }, true);
        }
    };

    function blank(x) { return x === '' || x === undefined }
    function event_input_filter(event, set_defaults, do_transforms, check_required) {
        if (!event) return null;

        set_defaults = set_defaults === undefined ? true : set_defaults;
        do_transforms = do_transforms === undefined ? true : do_transforms;
        check_required = check_required === undefined ? true : check_required;

        var fields = {  // undefined fields are required
            title:          undefined,
            description:    '',
            address:        undefined,
            latitude:       undefined,
            longitude:      undefined,
            attendees:      3,
            beginDate:      null,
            endDate:        null,
            beginTime:      null,
            endTime:        null,
            registerLink:   null
        };
        var required = Object.keys(fields).filter(function (x) { x === undefined });

        var transforms = {
            picture: function (event) {
                if (!event.picture) return;
                var match = event.picture.match(/^data:(image\/[\w+-]+);.*?base64,(.*)/);
                return match ? {
                    type: match[1],
                    data: new Buffer(match[2], 'base64')
                } : undefined
            },
            address: function (event) {
                if ('latitude' in event && 'longitude' in event)
                    return event.address;
            },
            latitude: function (event) {
                if ('address' in event && 'longitude' in event)
                    return event.latitude;
            },
            longitude: function (event) {
                if ('address' in event && 'latitude' in event)
                    return event.longitude;
            },
        };
        // pre-process the Date/Time fields
        ['begin', 'end'].forEach(function (pfx) {
            datetime_transform('Date', function (val) {
                return val ? new Date(val) : null;
            });
            datetime_transform('Time', function (val) {
                if (!val) return null;
                var m = val.match(/^(\d+):(\d+)\s*([ap]m)$/);
                return m ? new Date(0, 0, 0,
                    m[1] % 12 + (m[3] == "pm") * 12, m[2]) : null;
            });
            function datetime_transform(f, transform) {
                var dtf = pfx + f;
                transforms[dtf] = function(event) {
                    if (!event[dtf]) return;
                    var new_time = transform(event[dtf]);
                    return (new_time != "Invalid Date") ? new_time : null;
                };
            }
        });
        var evt = do_transforms ? util.objMap(transforms,
                function (transform) { return transform(event) }) : {};
        Object.keys(fields).forEach(function (f) {
            if (!(f in evt))
                evt[f] = (set_defaults && blank(event[f])) ? fields[f] : event[f];
        });
        if (check_required)
            evt = required.every(function (f) { return !blank(evt[f]) }) ? evt : null;
        return evt
    }
    function event_output_filter(event) {
        function fmtDate(x) { return new Date(x).toDateString() }
        function fmtTime(x) {
            var hms = new Date(x).toTimeString().split(' ')[0].split(':');
            var h = hms[0] % 12;
            if (h == 0) h = 12;
            return h + ':' + hms[1] + (Math.floor(hms[0] / 12) ? 'pm' : 'am');
        }

        var evt = {};
        Event.fields.forEach(function (p) {
            switch(p) {
                case 'beginDate':
                case 'endDate':
                    evt[p] = event[p] ? fmtDate(event[p]) : null;
                    evt[p] = evt[p] == "Invalid Date" ? null : evt[p];
                    break;
                case 'beginTime':
                case 'endTime':
                    evt[p] = event[p] ? fmtTime(event[p]) : null;
                    break;
                case 'organizer':
                    evt.organizerHash = md5(event[p]);
                    evt[p] = event[p];
                    break;
                case 'title':
                case 'description':
                case 'address':
                case 'latitude':
                case 'longitude':
                case 'attendees':
                case 'registerLink':
                case 'picture':
                case 'organizerHash':
                case 'organizerId':
                case 'id':
                    evt[p] = event[p];
            }
        });
        return evt;
    }
    function fetch_event(req, success, modify) {
        var res = req.res;
        return Event.find(req.params.id).success(function (event) {
            if (!event) return res.reply(404, 'Event not found');
            if (modify && req.session.email != event.organizer)
                return res.reply(403, 'User does not own Event');
            success(event);
        }).error(function (err) {
            res.reply(404, 'Event not found');
        });
    }
};
