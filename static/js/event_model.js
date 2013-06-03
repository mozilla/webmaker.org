define(['resource_model'], function (ResourceModel) {

    var EventModel = new ResourceModel({
        name:   'event',
        fields: [ 'title', 'description', 'address', 'latitude', 'longitude',
            'attendees', 'beginDate', 'beginTime', 'endDate', 'endTime',
            'registerLink', 'picture', 'organizer', 'created', 'id' ],
    });

    EventModel.prototype.datetimeHTML = function() {
        var bD = this.beginDate, eD = this.endDate,
            bT = this.beginTime, eT = this.endTime,
            icon = '<img class="icon-img" src="/img/map/calendar.png" />';
        function fmtRange(b, e, f) {
            var sep = (b && e ? ' - ' : '');
            return b || e ? '<div>' + f(b) + sep + f(e) + '</div>' : '';
        }
        if (!bD && !eD && !bT && !eT) return '';
        return '<div class="temporal-local">' + icon
            + '<div class="info-date">'
              + fmtRange(bD, eD, function (x) { return new Date(x).toDateString() })
              + fmtRange(bT, eT, function (x) { return new Date(x).toTimeString().split(' ')[0] })
            + '</div></div>';
    };

    EventModel.prototype.addressHTML = function() {
        if (!this.address) return '';
        var address_lines = this.address.split("\n");
        var icon = '<img class="icon-img" src="/img/map/pin-event.png" />';
        return '<div class="temporal-local">' + icon
            + '<div class="info-address">' + address_lines.map(function (line) {
                return '<div>' + line + '</div>';
            }).join("\n") + '</div></div>';
    };
    EventModel.prototype.organizerHTML = function() {
        return '<img src="http://lorempixel.com/75/75/" class="organizer-img" />'
            + '<div class="info-organizer"><span class="title">Organized by</span><br/>cassiemc</div>'
    };

    EventModel.prototype.popupHTML = function() {
        return '<div class="info-content">'
          + '<div class="info-title">' + this.title + '</div>'
          + '<div class="info-when-where">'
            + this.datetimeHTML()
            + this.addressHTML()
          + '</div>'
          + '<div class="info-description">' + this.description + '</div>'
          + this.organizerHTML()

            // show details button
          + '<a href="' + this._uri + '">'
          + '<span class="icon-stack icon-button-size info-button">'
                // XXX: change to span
              + '<i class="icon-sign-blank icon-stack-base icon-button-color"></i>'
              + '<i class="icon-chevron-right icon-light"></i>'
          + '</span></a></div>';
    };

    return EventModel;
});
