module.exports = function (init) {
  init('events', 'event');

  var Event = this.models.Event,
    s3 = this.s3,
    ctx = this,
    util = require('../util'),
    fs = require('fs'),
    crypto = require('crypto'),
    mapquest = require('mapquest'),
    express = require('express'),
    emailer = require("webmaker-postalservice")({
      key: process.env.AWS_ACCESS_KEY,
      secret: process.env.AWS_SECRET_KEY
    });

  function md5(data) {
    return crypto.createHash('md5').update(data).digest("hex");
  }

  var SAFE_FIELDS = ['id', 'title', 'description', 'address',
    'latitude', 'longitude', 'beginDate', 'beginTime', 'endDate', 'endTime',
    'attendees', 'registerLink', 'picture', 'organizerId', 'featured', 'uri'
  ];

  var PAGE_SIZE = 20;

  return {
    index: function (req, res) {
      list_events(req, 'map');
    },
    create: function (req, res) {
      var event = event_input_filter(req.body.event || req.body, [
        'title', 'address', 'latitude', 'longitude', 'beginDate', 'endDate'
      ]);

      if (!event)
        return res.reply(400, 'Invalid Event provided');

      if (!(event.organizer = req.session.email))
        return res.reply(401, 'Log in to create events');

      if (!(event.organizerId = req.session.username))
        return res.reply(403, 'Create an account first');

      var picture = event.picture;
      delete event.picture;

      var allowed = util.sans(SAFE_FIELDS, ['id', 'featured', 'picture']).concat('organizer');

      Event.create(event, allowed).success(picture_handler(picture, function (err, event) {
        if (err)
          return res.reply(500, {
            error: err
          });

        geocode_filler(event);
        res.reply(201, 'Event created', {
          event: event_output_filter(event)
        }, {
          location: event.uri()
        });

        if (process.env.ALLOW_SEND_EVENT_CREATE_EMAIL === 'true' &&
          res.locals.user.sendEventCreationEmails) {
          emailer.sendCreateEventEmail({
            to: event.organizer,
            fullName: event.organizerId
          }, function (emailErr, email) {
            if (emailErr) {
              return console.error(emailErr);
            }

            console.log("Sent create event email with id %s", email.MessageId);
          });
        }
      })).error(function (err) {
        res.reply(400, 'Invalid Event provided', {
          error: err
        });
      });
    },
    details: function (req, res) {
      fetch_event(req, function (event) {
        res.format({
          html: ['details', {
            event: event_output_transform(event)
          }],
          json: [200, {
            event: event_output_filter(event)
          }]
        });
      });
    },
    change: function (req, res) {
      var changes = event_input_filter(req.body.event || req.body, []);

      if (!changes)
        return res.reply(400, 'Invalid Event changes requested');

      var allowed = util.sans(SAFE_FIELDS, ['id', 'featured', 'picture', 'organizerId']);

      Object.keys(changes).filter(function (k) {
        return isBlank(changes[k]);
      })
        .map(function (k) {
          delete changes[k];
        });

      var picture = changes.picture;
      delete changes.picture;

      fetch_event(req, function (event, isAdmin) {
        if (isAdmin)
          allowed.push('featured');

        event.updateAttributes(changes, allowed).success(picture_handler(picture, function (err, event) {
          if (err)
            return res.reply(500, {
              error: err
            });
          geocode_filler(event);
          res.reply(200, 'Event modified', {
            event: event_output_filter(event)
          });
        })).error(function (err) {
          res.reply(400, 'Invalid Event changes', {
            error: err
          });
        });
      }, true);
    },
    destroy: function (req, res) {
      fetch_event(req, function (event) {
        var picture = event.picture;
        event.destroy().success(function () {
          if (picture) {
            s3.delete(picture);
          }
          res.reply(200, 'Event deleted');
        }).error(function (err) {
          res.reply(500, {
            error: err
          });
        });
      }, true);
    },
    admin: function (req, res) {
      list_events(req, 'admin', true);
    },
    metrics: function (req, res) {
      Event.all().success(function (events) {
        var users = {},
          cities = {},
          countries = {},
          attendees = 0,
          upcoming = events.filter(function (event) {
            users[event.organizer] = 1;
            cities[event.city] = 1;
            countries[event.country] = 1;
            attendees += event.attendees;
            return (event.endDate || Infinity) >= new Date();
          }).length;
        var event_stats = {
          total_events: events.length,
          upcoming_events: upcoming,
          users: Object.keys(users).length,
          total_attendees: attendees,
          cities: Object.keys(cities).length,
          countries: Object.keys(countries).length
        };
        res.format({
          html: ['metrics', {
            stats: event_stats
          }],
          json: [200, {
            stats: event_stats
          }]
        });
      }).error(function (err) {
        res.reply(500, err);
      });
    }
  };

  function geocode_filler(event) {
    mapquest.reverse({
      latitude: event.latitude,
      longitude: event.longitude
    }, function (err, loc) {
      if (err || !loc) {
        console.error('[webmaker-events] Error doing reverse lookup for event location with MapQuest API: ' + err);
        return;
      }
      event.updateAttributes({
        city: loc.adminArea5,
        country: loc.adminArea1
      }).error(function(err) {
        console.error('[webmaker-events] Error updating city/country for event location');
        console.error(err);
      });
    });
  }

  function picture_handler(picture, cb) {
    return function (event) {
      if (picture)
        s3.put(picture.data, picture.type, function (f) {
          if (event.picture) {
            s3.delete(event.picture);
          }
          event.updateAttributes({
            picture: s3.url(f)
          }).success(function (event) {
            cb(null, event);
          }).error(function (err) {
            cb(err);
          });
        });
      else cb(null, event);
    }
  }

  function isBlank(x) {
    return x === '' || x === undefined;
  }

  function event_input_filter(event, required, fields) {
    if (!event) return null;

    required = util.ifndef(required, []);
    fields = util.ifndef(fields, SAFE_FIELDS);

    var transforms = {
      picture: function (event) {
        if (!event.picture) return;
        var match = event.picture.match(/^data:(image\/[\w+-]+);.*?base64,(.*)/);
        return match ? {
          type: match[1],
          data: new Buffer(match[2], 'base64')
        } : undefined;
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
      featured: function (event) {
        var bool_true = event.featured == true,
          bool_false = event.featured == false,
          sbool_true = event.featured == "true",
          sbool_false = event.featured == "false",
          snum_true = event.featured == "1",
          snum_false = event.featured == "0";
        if (bool_true ^ bool_false)
          return bool_true
        if (sbool_true ^ sbool_false)
          return sbool_true
        if (snum_true ^ snum_false)
          return snum_true
        return Boolean(event.featured)
      },
      attendees: function (event) {
        if (event.attendees)
          return parseInt(event.attendees);
      },
    };
    // Date/Time field transforms
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
        transforms[dtf] = function (event) {
          if (!event[dtf]) return;
          var new_time = transform(event[dtf]);
          return (new_time != "Invalid Date") ? new_time : null;
        };
      }
    });

    var evt = util.objMap(transforms, function (transform) {
      return transform(event)
    });

    fields.filter(function (f) {
      return !(f in evt) && !isBlank(event[f])
    })
      .forEach(function (f) {
        evt[f] = event[f]
      });

    return required.every(function (f) {
      return !isBlank(evt[f])
    }) ? evt : null;
  }

  function event_output_transform(event) {
    function fmtDate(x) {
      var date = new Date(x);
      return date == "Invalid Date" ? null : [
        date.getMonth() + 1, date.getDate(), date.getFullYear()
      ].join('/');
    }

    function fmtTime(x) {
      if (x == "Invalid Date")
        return null;
      var hms = new Date(x).toTimeString().split(' ')[0].split(':');
      var h = hms[0] % 12;
      if (h == 0) h = 12;
      return h + ':' + hms[1] + (Math.floor(hms[0] / 12) ? 'pm' : 'am');
    }

    var evt = {};
    Event.fields.forEach(function (p) {
      switch (p) {
      case 'beginDate':
      case 'endDate':
        evt[p] = event[p] ? fmtDate(event[p]) : null;
        break;
      case 'beginTime':
      case 'endTime':
        evt[p] = event[p] ? fmtTime(event[p]) : null;
        break;
      case 'organizer':
        evt.organizerHash = md5(event[p]);
        evt.organizer = event[p];
        break;
      default:
        evt[p] = event[p];
      }
    });
    evt.uri = event.uri();
    return evt;
  }

  function event_output_filter(event) {
    var fields = SAFE_FIELDS;
    event = event_output_transform(event);
    var evt = {};
    Event.fields.filter(function (p) {
      return fields.indexOf(p) > -1
    })
      .forEach(function (p) {
        evt[p] = event[p]
      });
    return evt;
  }

  function fetch_event(req, cb, modify) {
    var res = req.res;

    function _find_event(isAdmin) {
      Event.find(req.params.id).success(function (event) {
        if (!event)
          return res.reply(404, 'Event not found');

        if (modify && req.session.email != event.organizer && !isAdmin)
          return res.reply(403, 'User does not own Event');

        cb(event, isAdmin);
      }).error(function (err) {
        res.reply(404, 'Event not found');
      });
    }

    if (req.session.username && modify)
      ctx.loginAPI.getUserById(req.session.id, function (err, user) {
        if (err || !user) {
          return res.reply(500, err || "User does not exist");
        }
        _find_event(user.isAdmin);
      })
    else _find_event(false);
  }

  function list_events(req, view, requireAdmin) {
    var res = req.res;

    function _reply_events(body, isAdmin) {
      var events_safe = body.events.map(event_output_filter),
        events = body.events.map(event_output_transform);

      res.format({
        html: function () {
          body.events = events;
          res.reply(view, body);
        },
        json: function () {
          body.events = isAdmin ? events : events_safe;
          res.reply(200, body);
        },
        csv: function () {
          body.events = isAdmin ? events : events_safe;
          var fields = isAdmin ? SAFE_FIELDS.concat('organizer') : SAFE_FIELDS;
          var source_array = body.events.map(function (event) {
            return fields.map(function (c) {
              return event[c]
            })
          });
          source_array.unshift(fields);
          res.reply(200, source_array);
        }
      })
    }

    function _list_events(isAdmin) {
      if (req.query._page || req.query._limit) {
        // paginate results
        var page = Math.abs(parseInt(req.query._page) || 0),
          limit = Math.abs(parseInt(req.query._limit) || PAGE_SIZE);

        Event.findAll({
          offset: page * limit,
          limit: limit
        }).success(function (events) {
          var count = events.length;

          _reply_events({
            count: count,
            page: page,
            next: count ? '/events/?_page=' + (page + 1) : null,
            previous: page ? '/events/?_page=' + (page - 1) : null,
            offset: page * limit,
            events: events
          }, isAdmin);
        }).error(function (err) {
          res.reply(500, {
            error: err
          });
        });
      } else Event.all().success(function (events) {
        _reply_events({
          events: events
        }, isAdmin);
      }).error(function (err) {
        res.reply(500, {
          error: err
        });
      });
    }
    if (req.session.username || requireAdmin)
      ctx.loginAPI.getUserById(req.session.id, function (err, user) {
        if (err || !user)
          return res.reply(500, err || "User does not exist");

        if (requireAdmin && !user.isAdmin)
          return res.reply(403, 'Must be an admin user.');


        _list_events(user.isAdmin);
      })
    else _list_events(false);
  }
};
