define(['jquery', 'model', 'forms', 'bootstrap-markdown', 'domReady!'],
function ($, EventModel, forms) { return function (mapMaker) {

    var $findForm   = $('form#find-event');
    $findForm.find('button[type="submit"]').click(function (ev) {
        ev.preventDefault();
        $findForm.submit();
    });
    var $when  = $findForm.find('input[name="when"]'),
        $where = $findForm.find('input[name="where"]');
    $findForm.on("submit", function(ev) {
        ev.preventDefault();
        EventModel.all(function (models) {
            mapMaker.clearMarkers();
            var targetDateStr = $when[0].value;
            if (!targetDateStr)
                mapMaker.dropPins(models, false);
            else {
                var targetDate = new Date(targetDateStr.split('-'));
                mapMaker.dropPins(models, false, function (model) {
                    var beginDate  = new Date(model.beginDate),
                        endDate    = new Date(model.endDate);
                    if (model.beginDate && model.endDate)
                        return beginDate <= targetDate
                            && endDate >= targetDate
                    else if (beginDate)
                        return beginDate <= targetDate
                    else if (endDate)
                        return endDate >= targetDate
                    else return true
                });
            }
        });
    });
    mapMaker.setupAutocomplete($where[0], true, function (place) {
        mapMaker.closeInfoWindow();
        if (place.geometry) {
            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                this.google_map.fitBounds(place.geometry.viewport);
            } else {
                this.google_map.setCenter(place.geometry.location);
                this.google_map.setZoom(14);
            }
        } else {
            this.updateLocation();
        }
    });

    var $createForm = $('form#create-event');
    $createForm.validate({
        rules: {
            title: 'required',
            registerLink: 'url',
            address: 'required'
        },
        submitHandler: function() {
            var form_fields = $createForm.serializeArray();
            var data = { event: {} };
            form_fields.forEach(function (f) {
                if (f.name) switch (f.name) {
                    case '_csrf':
                        data[f.name] = f.value;
                        break;
                    case 'address': // TODO: split address into two lines
                    default:
                        data.event[f.name] = f.value;
                }
            });
            $.post($createForm.attr('action'), data, function (data) {
                if (data.event) {
                    toggleCreateForm();
                    scroll(0, 0);
                    var evt = new EventModel(data.event);
                    $where.val('');
                    mapMaker.google_map.setCenter(
                        new google.maps.LatLng(evt.latitude, evt.longitude)
                    );
                    mapMaker.addMarker(evt);
                }
            }, 'json').error(function (res) {
                switch (res.status) {
                    case 401:
                        navigator.idSSO.request();
                        break;
                    default:
                }
            });
        },
        errorPlacement: function ($errors, $elem) {
            $elem.prop('placeholder', $errors.first().text());
        },
        highlight: function (input, errorClass, validClass) {
            var $parent = $(input).parent('.ui-append');
            $parent.addClass(errorClass).removeClass(validClass);
        },
        unhighlight: function (input, errorClass, validClass) {
            var $parent = $(input).parent('.ui-append');
            $parent.addClass(validClass).removeClass(errorClass);
        }
    });
    var $beginTime = $createForm.find('[name="beginTime"]'),
        $endTime   = $createForm.find('[name="endTime"]');
    $beginTime.timepicker('option', {
        appendTo: function (elem) { return $(elem).parent() }
    });
    $endTime.timepicker('option', {
        appendTo: function (elem) { return $(elem).parent() }
    });

    mapMaker.setupAutocomplete($createForm.find('input[name="address"]')[0], false, function (place) {
        if (place && place.geometry) {
            var loc = { latitude:   place.geometry.location.lat(),
                        longitude:  place.geometry.location.lng() };
            for (var k in loc)
                $createForm.find('input[name="'+k+'"]').val(loc[k]);
        }
    });

    forms.setupImageUpload($createForm);
    forms.setupSelectUI($createForm);

    // setup form toggle button
    function toggleCreateForm() {
        $createForm[0].reset();
        $createForm.toggleClass('hidden');
        $(".overlay-buttons").toggleClass('hidden');
    }
    $(".expand-form-button").click(function(ev) {
        ev.preventDefault();
        toggleCreateForm();
    });
    navigator.idSSO.watch( {
      onlogin: function( assert ){
        var $button = $('.loggedout-expand-form-button')
          .removeClass('loggedout-expand-form-button')
          .addClass('expand-form-button')
          .click(function(ev) {
            ev.preventDefault();
            toggleCreateForm();
          });
        $('.event-button-text', $button).text('Add an Event');
        if( document.referrer.indexOf( 'login' ) !== -1 ){
          toggleCreateForm();
          $( '#event_title' ).focus();
        }
      },
      onlogout: function(){
        var $button = $('.expand-form-button')
          .addClass('loggedout-expand-form-button')
          .removeClass('expand-form-button')
          .unbind('click');
        $('.event-button-text', $button).text('Log in to add an Event');
      }
    } );


    EventModel.all(function (events) { mapMaker.dropPins(events) });
}});
