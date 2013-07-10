define(['jquery', 'google', 'map/map_maker', 'map/forms'],
function ($, google, MapMaker, EventForms) {

    var gm = google.maps;
    gm.visualRefresh = true;
    var mapCenter = new gm.LatLng(20.324167, 30.029293); // CONGO
    var mapOptions = {
        zoom: 3,  // starting zoom level, show whole world
        mapTypeId: gm.MapTypeId.ROADMAP,
        center: mapCenter,
        backgroundColor: "#a5bfdd", // set color of loading tiles

        rotateControl: false,
        scaleControl: true,
        streetViewControl: true,
        overviewMapControl: false,

        mapTypeControl: false,
        mapTypeControlOptions: {
            style: gm.MapTypeControlStyle.HORIZONTAL_BAR,
            mapTypeIds: [ 'webmaker_style',
                gm.MapTypeId.ROADMAP, gm.MapTypeId.SATELLITE,
                gm.MapTypeId.HYBRID, gm.MapTypeId.TERRAIN ]
        },

        panControl: true,
        panControlOptions: {
            position:   gm.ControlPosition.TOP_RIGHT
        },
        zoomControl: true,
        zoomControlOptions: {
            style:      gm.ZoomControlStyle.LARGE,
            position:   gm.ControlPosition.TOP_RIGHT
        }
    };
    var mcOptions = {
        gridSize: 20,
        maxZoom: 15,    // Don't cluster after this zoom level
                        // (clicking on a cluster goes to zoom 16)
        imagePath: "/img/map/c",
        imageSizes: [43, 43, 43, 43, 43]
    };
    var omsOptions = {
        keepSpiderfied: true,
        legWeight: 0.8
    };

    var mapMaker = new MapMaker($('#map-canvas')[0], mapOptions, mcOptions, omsOptions);
    mapMaker.setupInfoWindow();
    mapMaker.updateLocation() ;

    EventForms(mapMaker);

    return mapMaker;
});
