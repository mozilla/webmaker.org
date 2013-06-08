define(['jquery', 'model', '../base/ui', 'bootstrap-markdown', 'jquery.form', 'jquery.timepicker', 'jquery-ui.datepicker'],
function ($, EventModel, UI) { return function (mapMaker) {
    $.event.props.push('dataTransfer');
    $(document).ready(function () {
        var $createForm = $('form#create-event');
        var $findForm   = $('form#find-event');

        var $fileInput = $createForm.find('input[type="file"]');
        var $uploadDiv = $createForm.find('#image-upload');
        $uploadDiv.on("click", function(ev) {
            ev.preventDefault();
            $fileInput.click();
        }).on("dragenter dragover drop", function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
        }).on("drop", function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            handleImg(ev.dataTransfer.files[0]);
        });
        $fileInput.on("change", function (ev) {
            handleImg(this.files[0]);
        });
        // based on MDN example
        function handleImg(file) {
            if (file.type.match(/image.*/)) {
                if (!$uploadDiv._prev_text)
                    $uploadDiv._prev_text = $uploadDiv.text();
                $uploadDiv.html("<img />");
                var img = $uploadDiv.find("img")[0];
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

        $createForm.find('button[type="submit"]').click(function (ev) {
            ev.preventDefault();
            $createForm.submit();
        });
        $createForm.on("submit", function(ev) {
            ev.preventDefault();
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
                    mapMaker.addMarker(new EventModel(data.event));
                }
            }, 'json');
            return false;
        });

        $findForm.find('button[type="submit"]').click(function (ev) {
            ev.preventDefault();
            $findForm.submit();
        });
        var $when = $findForm.find('input[name="find-when"]');
        $when.blur(function(ev) { $findForm.submit() });
        mmm = mapMaker;
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


        // setup form toggle button
        function toggleCreateForm() {
            var $select = $('select[name="attendees"]');
            $createForm[0].reset();
            $select.next('.ui-select').remove();
            UI.select($select);
            $uploadDiv.find('> img').attr('src', '');
            $uploadDiv.text($uploadDiv._prev_text);

            $createForm.toggleClass('hidden');
            $("#add-event-button").toggleClass('hidden');
        }
        $(".formExpandButton").click(function(ev) {
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

        $createForm.find('.datepicker').datepicker().each(function(i, elem) {
            $(elem).next('.icon').click(function () { $(elem).focus() });
        });
        $createForm.find('.timepicker').timepicker().each(function(i, elem) {
            $(elem).next('.icon').click(function () { $(elem).focus() });
        }).on('showTimepicker', function () {
            var $parent = $(this).parent();
            $parent.find('.ui-timepicker-wrapper')
                .css('width', $parent.css('width'))
                .css('left', '0px');
        });
        var $beginTime = $('[name="beginTime"]'),
            $endTime   = $('[name="endTime"]');
        $beginTime.timepicker({
            appendTo: function (elem) { return $(elem).parent() }
        });
        $endTime.timepicker({
            appendTo: function (elem) { return $(elem).parent() },
            showDuration: true
        });

        EventModel.all(function (models) { mapMaker.dropPins(models) });

        window.scroll(0,0);
    });
}})
