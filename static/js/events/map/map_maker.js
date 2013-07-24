define(['jquery', 'google', 'infobubble', 'oms', 'markerclusterer'],
function ($, google, InfoBubble, OverlappingMarkerSpiderfier, MarkerClusterer) {

    function MapMaker(map_canvas, mapOptions, mcOptions, omsOptions) {
        this.map_canvas = map_canvas;
        this.google_map = new google.maps.Map(map_canvas, mapOptions);
        this.geocoder = new google.maps.Geocoder();
        this.markerManager = new MarkerClusterer(this.google_map, [], mcOptions);
        this.infoWindow = undefined;

        var self = this;
        // this handles multiple markers at the same location
        this.oms = new OverlappingMarkerSpiderfier(this.google_map, omsOptions);
        this.oms.addListener('click', function(marker, evt) {
            self.showInfoWindow(marker);
        });
        google.maps.event.addListener(this.google_map, 'zoom_changed', function(ev) {
            setTimeout(function () {
                if (self.google_map.getZoom() <= 15) return;
                var markers = self.oms.markersNearAnyOtherMarker();
                var seen = {};
                var clusters = [];
                var ID = '__gm_id';
                markers.forEach(function (m) {
                    if (m[ID] in seen) return;
                    self.oms.markersNearMarker(m).forEach(function (nm) {
                        seen[nm[ID]] = true;
                    });
                    clusters.push(m);
                    seen[m[ID]] = true;
                });
                clusters.forEach(function (m) {
                    google.maps.event.trigger(m, 'click');
                });
            }, 400);
        });
    }
    MapMaker.prototype.dropPins = function (models, animate, filter) {
        animate = (animate === undefined) ? true : animate;

        var self = this;
        models.forEach(function (model) {
            if (filter && !filter(model)) return;

            if (animate)
                setTimeout(function() { self.addMarker(model, animate) },
                      300 + (500 * Math.random()));
            else
                self.addMarker(model, animate);
        })
    };
    MapMaker.prototype.addMarker = function (model, animate, dim) {
        animate = animate === undefined ? true  : animate;
        dim     = dim     === undefined ? false : dim;

        var icon = {
            url: "/img/map/pin-event" + (
                     model.featured ? "-featured" : ""
                ) + ".png"   // 43 x 51
        };

        var marker = new google.maps.Marker({
            title: model.title,
            position: new google.maps.LatLng(model.latitude, model.longitude),
            icon: icon,
            draggable: false,
            animation: animate ? google.maps.Animation.DROP : undefined,
            // Point where info window is shown, horizontal is not used in
            // infoBubble.js -- see markers anchor for this horizontal adjustment
            anchorPoint: new google.maps.Point(0, 20),
        });

        this.markerManager.addMarker(marker);
        this.oms.addMarker(marker);    // must keep oms in sync
        scroll(0, 0);

        // store the content for the info window in the marker
        marker.set('infoContent', model.popupHTML());
        marker.set('model', model);

        return marker;
    };
    /* Delete all markers by removing references to them */
    MapMaker.prototype.clearMarkers = function () {
        this.markerManager.clearMarkers();
        this.oms.clearMarkers();
        return this;
    }
    MapMaker.prototype.getMarkers = function() {
        return this.markerManager.getMarkers();
    };
    MapMaker.prototype.setupInfoWindow = function () {
        var self = this;
        google.maps.event.addListener(this.google_map, 'click', function(ev) {
            self.closeInfoWindow();
        });
    };
    MapMaker.prototype.closeInfoWindow = function () {
        if (this.infoWindow) {
            this.infoWindow.setMap(null);
            this.infoWindow = undefined;
        }
    };
    MapMaker.prototype.showInfoWindow = function(marker) {
        latLng = marker.position;

        // close info window if clicking on already shown info window
        if (this.infoWindow) {
            if (latLng.equals(this.infoWindow.get('position'))) {
                this.closeInfoWindow();
                return;
            }
        }

        this.closeInfoWindow();

        this.infoWindow = new InfoBubble({ // TODO: move styling into less/css file
            position: latLng,
            minWidth: 330,
            maxWidth: 330,
            minHeight: 130,
            maxHeight: 710,
            shadowStyle: 1,
            padding: 0,
            // Padding around the tabs, now set separately from the InfoBubble padding
            tabPadding: 12,
            // You can set the background color to transparent, and define a class instead
         // backgroundColor: 'transparent',
            borderRadius: 8,
            borderWidth: 1,
            // Now that there is no borderWidth check, you can define
            // a borderColor and it will apply to Just the arrow
            disableAutoPan: false,
            hideCloseButton: true,
            arrowPosition: '50%',
            backgroundColor: '#fff',
            backgroundClassName: 'info-container',
            // define a CSS class name for all, this is technically the "inactive" tab class
            tabClassName: 'tabClass',
            // define a CSS class name for active tabs only
            activeTabClassName: 'activeTabClass',
            arrowSize: 20,
            arrowStyle: 0
        });

        this.infoWindow.setContent(marker.get('infoContent'));
        this.infoWindow.open(this.google_map, marker);
    };
    MapMaker.prototype.setupAutocomplete = function (input, cityLevel, cb) {
        var options = { types: cityLevel ? ['(regions)'] : ['geocode', 'establishment'] }; // [] is all
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        autocomplete.bindTo('bounds', this.google_map);

        var self = this;
        // listen for location changes on this text field and center the map on new position
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
            var place = autocomplete.getPlace();
            cb.call(self, place);
        });
    };
    MapMaker.prototype.updateLocation = function() {
        var google_map = this.google_map;
        function getCurrentPosition_success(pos) {
            var crd = pos.coords;
            var mapCenter = new google.maps.LatLng(crd.latitude, crd.longitude);
            google_map.setZoom(13);
            google_map.setCenter(mapCenter);
        }
        function getCurrentPosition_error(err) {
            console.warn('ERROR(' + err.code + '): ' + err.message);
        };
        var options = {
            enableHighAccuracy: true,
            timeout: 1000,
            maximumAge: 0,
            };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getCurrentPosition_success, getCurrentPosition_error, options);
        } else {
            console.log("Sorry - your browser doesn't support geolocation!");
        }
    }
    return MapMaker;
});
