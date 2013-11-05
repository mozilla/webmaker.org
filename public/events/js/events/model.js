define(['resource_model', 'localized', 'markdown'], function (ResourceModel, localized) {

    var EventModel = new ResourceModel({
        name:   'event',
        fields: [ 'id', 'title', 'description', 'address', 'latitude', 'longitude',
            'attendees', 'beginDate', 'beginTime', 'endDate', 'endTime',
            'registerLink', 'picture', 'organizerId', 'organizerHash', 'featured' ],
    });
    var lang = $('html').attr('lang');

    EventModel.prototype.datetimeHTML = function() {
        var bD = this.beginDate, eD = this.endDate,
            bT = this.beginTime, eT = this.endTime,
            icon = '<img class="icon-img" src="/img/event-detail-icon-calendar.png" />';
        function fmtRange(b, e) {
            var sep = (b && e ? ' - ' : '');
            return b || e ? '<div>' + (b ? b : '') + sep + (e ? e : '') + '</div>' : '';
        }
        if (!bD && !eD && !bT && !eT) return '';
        return '<div class="temporal-local">' + icon
            + '<div class="info-date">'
              + fmtRange(bD, eD)
              + fmtRange(bT, eT)
            + '</div></div>';
    };

    EventModel.prototype.addressHTML = function() {
        if (!this.address) return '';
        var address_lines = this.address.match(/^([^,]+),(.*)/);
        if (address_lines) address_lines.shift(); // remove global match
        else address_lines = [this.address];
        var icon = '<img class="icon-img" src="/img/event-detail-icon-pointer.png" />';
        return '<div class="temporal-local">' + icon
            + '<div class="info-address">' + address_lines.map(function (line) {
                return '<div>' + line + '</div>';
            }).join("\n") + '</div></div>';
    };
    EventModel.prototype.organizerHTML = function() {
      localized.ready(function(){});
        return '<img src="https://secure.gravatar.com/avatar/' + this.organizerHash + '" class="organizer-img" />'
            + '<div class="info-organizer"><span class="title">' + localized.get("Organized by") + '</span><br/>'
            + this.organizerId + '</div>'
    };
    EventModel.prototype.descriptionHTML = function() {
        var desc = this.description || "",
            max_len  = 240;
        if (desc.length > max_len) {
            desc = desc.substring(0, max_len);
            desc = desc.replace(/\w+$/, '');
            desc += ' ...';
        }
        return '<div class="info-description">' + markdown.toHTML(desc) + '</div>'
    };

    // TODO: convert to html-fragment
    EventModel.prototype.popupHTML = function() {
        return '<div class="info-content">'
               + '<div class="info-title">' + this.title + '</div>'
               + '<div class="info-when-where">'
                 + this.datetimeHTML()
                 + this.addressHTML()
               + '</div>'
               + this.descriptionHTML()
               + '<div id="bottom-row">'
                 + this.organizerHTML()
                 + '<a id="event-details-link" href="/' + lang + this._uri + '">'
                 + '<i class="icon-chevron-right"></i></a>'
                 + '<span class="clear"></span>'
               + '</div>'
             + '</div>';
    };

    return EventModel;
});
