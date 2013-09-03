define(['jquery', 'google', 'map/map_maker', 'map/forms', 'responsive'],
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
        scaleControl: false,
        overviewMapControl: false,
        mapTypeControl: false,
        panControl: false,

        zoomControl: true,
        zoomControlOptions: {
            position:   gm.ControlPosition.TOP_RIGHT
        },
        streetViewControl: true,
        streetViewControlOptions: {
            position:   gm.ControlPosition.TOP_RIGHT
        }
    };
    var mcOptions = {
        gridSize: 20,
        maxZoom: 15,    // Don't cluster after this zoom level
                        // (clicking on a cluster goes to zoom 16)
        calculator: function(markers, numStyles) {
          var title = '',
              index = 0,
              len = markers.length,
              count = len.toString();

          return {
            text: count,
            index: (count > 9) ? 2 : 1,
            title: title
          };
        },
        styles: [
          { url: '/img/map/c1.png',
            anchor: [0, 20],
            fontFamily: 'Open Sans',
            textSize: 10,
            height: 43,
            width: 43 },
          { url: '/img/map/c1.png',
            anchor: [0, 17],
            fontFamily: 'Open Sans',
            textSize: 10,
            height: 43,
            width: 43 }
        ]
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
