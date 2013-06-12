define(['jquery', 'model', 'forms', 'bootstrap-markdown', 'domReady!'],
function ($, EventModel, forms) { return function (mapMaker) {
    var $findForm   = $('form#find-event');
    $findForm.find('button[type="submit"]').click(function (ev) {
        ev.preventDefault();
        $findForm.submit();
    });
    var $when  = $findForm.find('input[name="find-when"]'),
        $where = $findForm.find('input[name="find-where"]');
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
                console.log(data.event);
                if (data.event) {
                    toggleCreateForm();
                    scroll();
                    var evt = new EventModel(data.event);
                    $where.val('');
                    mapMaker.google_map.setCenter(
                        new google.maps.LatLng(evt.latitude, evt.longitude)
                    );
                    mapMaker.addMarker(evt);
                }
            }, 'json');
        },
        errorPlacement: function ($errors, $elem) {
            $elem.prop('placeholder', $errors.first().text());
        },
        highlight: function (input, errorClass, validClass) {
            var $parent = $(input).parent('.ui-append');
            console.log($parent);
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

    forms.setupImageUpload($createForm);
    forms.setupSelectUI($createForm);
    forms.setupAddressField($createForm, mapMaker);

    // setup form toggle button
    function toggleCreateForm() {
        $createForm[0].reset();
        $createForm.toggleClass('hidden');
        $("#add-event-button").toggleClass('hidden');
    }
    $(".formExpandButton").click(function(ev) {
        ev.preventDefault();
        toggleCreateForm();
    });

    EventModel.all(function (events) { mapMaker.dropPins(events) });
}});
