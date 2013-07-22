#!/usr/bin/env node

var orm = require('../lib/orm');

/* old attendee values
0> 1-10
1> 10-20
2> 20-50
3> 50-100
4> 100-200
5> 200-500
*/

orm.models.Event.all().success(function(events) {
    events.forEach(function(event) {
        var attendee_conversion = [
            5, 15, 35, 75, 150, 350
        ]
        event.updateAttributes({
            attendees: attendee_conversion[event.attendees] || event.attendees
        });
    });
}).error(console.error.bind(console));
