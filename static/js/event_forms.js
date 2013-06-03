define(['jquery', 'event_model'],
function ($, EventModel) { return function (mapMaker) {
    $(document).ready(function () {
        var create_form = $('form#create-event');
        var find_form = $('form#find-event');

        var file_input = create_form.find('input[type="file"]');
        var upload_div = create_form.find('#image-upload');
        upload_div.on("click", function(ev) {
            ev.preventDefault();
            file_input.click();
        }).on("dragenter dragover drop", function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
        }).on("drop", function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            handleImg(ev.dataTransfer.files[0]);
        });
        file_input.on("change", function (ev) {
            handleImg(this.files[0]);
        });
        // based on MDN example
        function handleImg(file) {
            if (file.type.match(/image.*/)) {
                upload_div.html("<img />");
                var img = upload_div.find("img")[0];
                img.file = file;

                var reader = new FileReader();
                reader.onload = (function(img) {
                    return function(ev) {
                        img.src = ev.target.result;
                        $('.upload input[name="picture"]')[0].value = img.src;
                    };
                })(img);
                reader.readAsDataURL(file);
            }
        }

        create_form.find('button[type="submit"]').click(function (ev) {
            ev.preventDefault();
            create_form.submit();
        });
        create_form.on("submit", function(ev) {
            ev.preventDefault();
            var form_fields = create_form.serializeArray();
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
            $.post(create_form.attr('action'), data, function (data) {
                console.log(data.event);
                if (data.event) {
                    toggleCreateForm();
                    mapMaker.addMarker(new EventModel(data.event));
                }
            }, 'json');
            return false;
        });

        find_form.find('button[type="submit"]').click(function (ev) {
            ev.preventDefault();
            find_form.submit();
        });
        var find_when = find_form.find('input[name="find-when"]');
        find_when.blur(function(ev) { find_form.submit() });
        mmm = mapMaker;
        find_form.on("submit", function(ev) {
            ev.preventDefault();
            EventModel.all(function (models) {
                mapMaker.clearMarkers();
                var targetDateStr = find_when[0].value;
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

        // setup form toggle button
        function toggleCreateForm() {
            create_form[0].reset();

            create_form.toggleClass('toggleHidden');
            $("#add-event-button").toggleClass('toggleHidden');
        }
        $("h2.formExpandButton").click(function(ev) {
            ev.preventDefault();
            toggleCreateForm();
        });

        mapMaker.setupAutocomplete($('input[name="address"]')[0], false, function (place) {
            var loc = { latitude:   place.geometry.location.lat(),
                        longitude:  place.geometry.location.lng() };
            for (var k in loc)
                $('form#create-event').find('input[name="'+k+'"]').val(loc[k]);
        });
        mapMaker.setupAutocomplete($('input[name="find-where"]')[0], true, function (place) {
            if (place.geometry) {
                // If the place has a geometry, then present it on a map.
                if (place.geometry.viewport) {
                    this.google_map.fitBounds(place.geometry.viewport);
                } else {
                    this.google_map.setCenter(place.geometry.location);
                    this.google_map.setZoom(14);
                }
            }
        });
        EventModel.all(function (models) {
            mapMaker.dropPins(models);
        });
    });
}})
