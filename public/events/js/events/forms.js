define(['jquery', '../base/ui', 'bootstrap-markdown', 'jquery.timepicker', 'jquery-ui.custom', 'domReady!'],
function ($, UI, MapMaker) {
    $('.clear-input').click(function () {
        $(this).prev('input').val('').trigger('change');
    });
    $('.datepicker').datepicker().each(function(i, elem) {
        $(elem).next('.icon').click(function () { $(elem).focus() });
    });
    $('.timepicker').timepicker({
        scrollDefaultTime: "10:00",
    }).each(function(i, elem) {
        $(elem).next('.icon').click(function () { $(elem).focus() });
    }).on('showTimepicker', function () {
        var $parent = $(this).parent();
        $parent.find('.ui-timepicker-wrapper')
            .css('width', $parent.css('width'))
            .css('left', '0px');
    });
    var $beginTime = $('[name="beginTime"]'),
        $endTime   = $('[name="endTime"]');
    $endTime.timepicker('option', {
        durationTime: function () {
            var beginTime = $beginTime.timepicker('getTime');
            return beginTime ? beginTime : '0:00am';
        },
        showDuration: true
    });

    return {
        setupImageUpload: function ($form) {
            var $fileInput = $form.find('input[type="file"]');
            var $uploadDiv = $form.find('#image-upload');
            $.event.props.push('dataTransfer');
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
                if (file.type.match(/^image\//)) {
                    if (!$uploadDiv._prev_text)
                        $uploadDiv._prev_text = $uploadDiv.text();
                    $uploadDiv.html("<img />");
                    var img = $uploadDiv.find("img")[0];
                    img.file = file;

                    var reader = new FileReader();
                    reader.onload = (function(img) {
                        return function(ev) {
                            img.src = ev.target.result;
                            $form.find('input[name="picture"]').prop('value', img.src);
                        };
                    })(img);
                    reader.readAsDataURL(file);
                }
            }
            $form.on('reset', function () {
                $uploadDiv.find('> img').prop('src', '');
                $uploadDiv.text($uploadDiv._prev_text);
                $form.find('input[name="picture"]').prop('value', '');
            });
        },
        setupSelectUI: function ($form) {
            $form.on('reset', function () {
                var $select = $('select[name="attendees"]');
                $select.next('.ui-select').remove();
                UI.select($select);
            });
        },
    };
})
