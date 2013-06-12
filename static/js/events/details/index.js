require.config({
    paths: {
        'google':           'map/google',
    }
});
define(['jquery', 'forms', 'google', 'domReady!'],
function ($, forms, google) {
    var $editForm = $('form#edit-event');
    function toggleEditMode() {
        $('.show').toggleClass('hidden');
        $('.edit').toggleClass('hidden');
    }
    new google.maps.places.Autocomplete($editForm.find('input[name="address"]')[0]);
    $editForm.find('button#edit-mode').click(function(ev) {
        toggleEditMode();
    });
    $editForm.find('button#cancel-edit').click(function(ev) {
        toggleEditMode();
    });
    $editForm.find('button#delete-event').click(function(ev) {
        // TODO: show modal with confirmation
    });
    forms.setupImageUpload($editForm);
});
