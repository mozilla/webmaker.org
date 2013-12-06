define(['jquery', 'google', 'map/map_maker', 'list/forms'],
function ($, google, MapMaker, EventForms) {

    var gm = google.maps;
    var mapCenter = new gm.LatLng(20.324167, 30.029293); // CONGO

    // queries the Google Maps Places API for a 'PlacesResult' object,
    // which contains data like lat/long, formatted address name, etc
    // See https://developers.google.com/maps/documentation/javascript/reference#Geocoder
    // for more information
    function getGooglePlaceResult(addr, autocomplete) {
      var addrText = $(addr).val();
      var geocoder = new google.maps.Geocoder();

      geocoder.geocode({address: addrText}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          google.maps.event.trigger(autocomplete, 'place_changed', results[0], true);
        }
      });
    }

    var UtilMethods = {};
    UtilMethods.setupAutocomplete = function(input, cityLevel, cb) {
      var self = this;
      var options = { types: cityLevel ? ['(regions)'] : ['geocode', 'establishment'] }; // [] is all
      var autocomplete = new google.maps.places.Autocomplete(input, options);

      // make sure that we query for address lat/long no matter what
      $(input).blur(function(e) {
        getGooglePlaceResult(input, autocomplete);
        return false;
      })
      .keydown(function(e) {
        if (e.which === 13) {
          getGooglePlaceResult(input, autocomplete);
          return false;
        }
      });

      // listen for location changes on this text field and center the map on new position
      google.maps.event.addListener(autocomplete, 'place_changed', function(results, needCoords) {
        var place;

        if (needCoords) {
          place = results;
        } else {
          place = autocomplete.getPlace();
        }

        cb.call(self, place);
      });
    };

    EventForms(UtilMethods);

    return MapMaker;
});
