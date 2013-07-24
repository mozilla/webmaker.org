define(['jquery', 'google', 'forms', 'domReady!'],
function ($, google, forms) {
    var $editForm = $('form#edit-event');

    $editForm.validate({
        rules: {
            registerLink: 'url'
        }
    });

    function toggleEditMode() {
        $('.show').toggleClass('hidden');
        $('.edit').toggleClass('hidden');
        location.hash = (location.hash == '#edit') ? '' : '#edit';
    }
    function enterEditMode() {
        $('.show').addClass('hidden');
        $('.edit').removeClass('hidden');
        location.hash = '#edit';
    }
    function leaveEditMode() {
        $('.show').removeClass('hidden');
        $('.edit').addClass('hidden');
        location.hash = '';
        $editForm[0].reset();
    }

    $editForm.find('button#edit-mode').click(enterEditMode);
    $editForm.find('button#cancel-edit').click(leaveEditMode);

    if (location.hash == '#edit')
        enterEditMode();

    var delete_safety = 1;
    $editForm.find('button#delete-event').click(function(ev) {
        var $deleteSubmit = $(this);
        if (delete_safety) {
            $('#delete-confirm').dialog({
                resizable:  false,
                height:     160,
                modal:      true,
                buttons: {
                    'Do It!': function() {
                        delete_safety = 0;
                        $(this).dialog('close');
                        $deleteSubmit.click();
                    },
                    Cancel: function() {
                        $(this).dialog('close');
                    }
                }
            });
            return false;
        }
    });
    forms.setupImageUpload($editForm);

    var ac = new google.maps.places.Autocomplete(
            $editForm.find('input[name="address"]')[0], { types: ['geocode'] });
    google.maps.event.addListener(ac, 'place_changed', function() {
        var place = autocomplete.getPlace();
        var loc = { latitude:   place.geometry.location.lat(),
                    longitude:  place.geometry.location.lng() };
        Object.keys(loc).forEach(function(k) {
            $editForm.find('input[name="'+k+'"]').val(loc[k]);
        });
    });

    navigator.idSSO.app.onlogin = function(assert) {
        $('#owner-panel').removeClass('hidden');
    };
    navigator.idSSO.app.onlogout = function() {
        $('#owner-panel').addClass('hidden');
    };

});
