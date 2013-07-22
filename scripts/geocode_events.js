#!/usr/bin/env node

var mapquest = require('mapquest');
var orm = require('../lib/orm');

orm.models.Event.all().success(function(events) {
    events.forEach(function(event) {
        mapquest.reverse({
            latitude:   event.latitude,
            longitude:  event.longitude
        }, function(err, loc) {
            event.updateAttributes({
                city:    loc.adminArea5,
                country: loc.adminArea1
            });
        });
    });
}).error(console.error.bind(console));
