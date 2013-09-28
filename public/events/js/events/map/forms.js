define(['jquery', 'model', 'forms', 'localized', 'bootstrap-markdown', 'domReady!'],
function ($, EventModel, forms, localized) { return function (mapMaker) {

    var $findForm   = $('form#find-event');
    $findForm.find('button[type="submit"]').click(function (ev) {
        ev.preventDefault();
        $findForm.submit();
    });
    var $when_start  = $findForm.find('input[name="when-start"]'),
        $when_end    = $findForm.find('input[name="when-end"]'),
        $where = $findForm.find('input[name="where"]');

    $findForm.find('[name|="when"]').on("change", function() {
        if (new Date($when_start.val()) > new Date($when_end.val())) {
            $(this).val((this.name == 'when-start' ? $when_end : $when_start).val());
        } else {
            $findForm.submit();
        }
    });
    $when_start.datepicker('setDate', new Date());

    var first_pindrop = true; // animate only the first time
    $findForm.on("submit", function(ev) {
        ev.preventDefault();

        EventModel.all(function (models) {
            var target_start = $when_start[0].value,
                target_end   = $when_end[0].value;

            var earliest = target_start ? new Date(target_start) : -Infinity,
                latest   = target_end   ? new Date(target_end)   : Infinity;

            mapMaker.clearMarkers().dropPins(models, first_pindrop, function (model) {
                var start = model.beginDate ? new Date(model.beginDate) : -Infinity,
                    end   = model.endDate   ? new Date(model.endDate)   : Infinity;

                return (start >= earliest && start <= latest)
                    || (end   >= earliest && end   <= latest)
                    || (start <= earliest && end   >= latest)
            });
            first_pindrop = false;
        });
    });
    $findForm.submit();
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

    $.validator.addMethod('afterStartDate', function(val, endElem) {
        var start   = $('#event_beginDate').val(),
            end     = $(endElem).val();
        if (start && end)
            return new Date(start) <= new Date(end);
        else return true;
    }, "End date must be after start date.");

    var $createForm = $('form#create-event'),
        $createFormArea = $('form#create-event .create-event-form'),
        $eventConfirmation = $('form#create-event .create-event-confirmation');
    $createForm.validate({
        rules: {
            title: 'required',
            registerLink: 'url',
            address: 'required',
            beginDate: 'required',
            endDate: 'required afterStartDate',
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
                    scroll(0, 0);
                    var evt = new EventModel(data.event);
                    $where.val('');
                    mapMaker.google_map.setCenter(
                        new google.maps.LatLng(evt.latitude, evt.longitude)
                    );
                    mapMaker.addMarker(evt);
                    openEventConfirmation(evt);
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

    function openEventConfirmation( event ) {
        var href = '/events/' + event.id;
        $createFormArea.toggleClass('hidden');
        $eventConfirmation.toggleClass('hidden');
        $('.confirmation-link a')
        .attr('href', href)
        .text(window.location.protocol + "//" + window.location.host  + href);
        $('#map-canvas').bind( 'click', function clickCallback() {
            toggleCreateForm();
            $('#map-canvas').unbind( 'click', clickCallback );
        });
    }
    // setup form toggle button
    function toggleCreateForm() {
        $createForm[0].reset();
        $createForm.toggleClass('hidden');
        $createFormArea.removeClass('hidden');
        $eventConfirmation.addClass('hidden');
        $(".overlay-buttons").toggleClass('hidden');
    }
    $(".expand-form-button").click(function(ev) {
        ev.preventDefault();
        toggleCreateForm();
    });

    localized.ready(function(){
      navigator.idSSO.app.onlogin = function( assert ){
        var $button = $('.loggedout-expand-form-button')
        .removeClass('loggedout-expand-form-button')
        .addClass('expand-form-button')
        .click(function(ev) {
          ev.preventDefault();
          toggleCreateForm();
        }
      );
      $('.event-button-text', $button).text( localized.get("Add an Event") );
      if( document.referrer.indexOf( 'login' ) !== -1 ){
        toggleCreateForm();
        $( '#event_title' ).focus();
      }
    };
    navigator.idSSO.app.onlogout = function(){
      var $button = $('.expand-form-button')
      .addClass('loggedout-expand-form-button')
      .removeClass('expand-form-button')
      .unbind('click');
      $('.event-button-text', $button).text( localized.get("Log in to add an Event") );
    };
  });
}});
