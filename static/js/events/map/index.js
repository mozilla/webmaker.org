require.config({
    paths: {
        'oms':          '/ext/js/oms',
        'infobubble':   '/ext/js/infobubble',
        'google':           'map/google',
        'markerclusterer':  'map/markerclusterer',
    }
});
define(['jquery', 'google', 'map/map_maker', 'forms'],
function ($, google, MapMaker, EventForms) {

    var defaultZoom = 13;

    function Address(place) {
        function findComponent(type, short) {
            place.address_components.forEach(function (c) {
                c.types.forEach(function (t) {
                    if (t == type)
                         return short ? c.short_name : c.long_name;
                });
            });
        };
        this.number     = findComponent("street_number",  false);
        this.street     = findComponent("route",          false);
        this.city       = findComponent("locality",       false);
        this.state      = findComponent("administrative_area_level_1", true);
        this.zip_code   = findComponent("postal_code",    true);
        this.country    = findComponent("country",        true);
    };
    Address.prototype.lines = function() {
        function X (x, y) { return x ? x + (y || '') : '' }
        return [
            X(this.number, ' ') + X(this.street,   ', ') + X(this.city, ', '),
            X(this.state,  ' ') + X(this.zip_code, ', ') + X(this.country)
        ]
    };
    Address.prototype.findPlace = function(cb) {
        var address = this.lines.join(' ');
        geocoder.geocode({ 'address': address }, function(results, status) {
            if (cb) cb(results, status == google.maps.GeocoderStatus.OK);
        });
    }

    function addDeleteAndLogButtons(map_canvas) {
        $("<button/>")
            .css({
                position: 'absolute',
                bottom: '12px',
                right: 0,
            })
            .text('Clear Markers')
            .appendTo($(map_canvas).parent())
            .click(deleteMarkers);

        $("<button/>")
            .css({
                position: 'absolute',
                bottom: '12px',
                left: 0,
            })
            .text('Log Markers')
            .appendTo($(map_canvas).parent())
            .click(logMarkers);
    }

    function setColorOptions() {
        var styles = [
            {
                featureType: "all",
                stylers: [
                    { saturation: -80 }
                ]
            },{
                featureType: "road.arterial",
                elementType: "geometry",
                stylers: [
                    { hue: "#00ffee" },
                    { saturation: 50 }
                ]
            },{
                featureType: "poi.business",
                elementType: "labels",
                stylers: [
                    { visibility: "off" }
                ]
            }
        ];

        // set style immediately (for testing)
        //map.setOptions({styles: styles});

        var styledMap = new google.maps.StyledMapType(styles, {name: "Webmaker Map"});
        map.mapTypes.set('webmaker_style', styledMap);
    }
    function setupFunctionOverrides() {  // TODO: consolidate utils/polyfills
        // string helper function to interpolate
        if (!String.prototype.interpolate) {
            String.prototype.interpolate = function (o) {
                return this.replace(
                    /\{([^{}]*)\}/g,
                    function (a, b) {
                        var r = o[b];
                        return typeof r === 'string' || typeof r === 'number' ? r : a;
                    }
                );
            };
        }
    }

    return (function () {
        setupFunctionOverrides();

        var mapCenter = new google.maps.LatLng(37.774546, -122.433523);
        var mapOptions = {
            zoom: defaultZoom,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: mapCenter,

            panControl: false,
            rotateControl: false,
            scaleControl: false,
            streetViewControl: true,
            overviewMapControl: false,

            mapTypeControl: false,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                mapTypeIds: [ 'webmaker_style',
                    google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE,
                    google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN ]
            },

            zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE
            }
        };
        var mcOptions = {
            gridSize: 20,
            maxZoom: 15,    // Don't cluster after this zoom level
                            // Clicking on a cluster goes to zoom 16,
                            //  we don't want clusters at this level.
            imagePath: "/img/map/c",
            imageSizes: [43, 43, 43, 43, 43]
        };

        // some stuff I want to keep around, but should be disabled for public releases
        var debugging = false
        if (debugging) {
            addDeleteAndLogButtons();
            setColorOptions();
        }

        var mapMaker = new MapMaker($('#map-canvas')[0], mapOptions, mcOptions);
        mapMaker.setupInfoWindow();
        mapMaker.updateLocation() ;

        EventForms(mapMaker);

        return mapMaker;
    })();
});
