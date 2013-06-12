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
    }
    $editForm.find('button#edit-mode').click(function(ev) {
        toggleEditMode();
    });
    $editForm.find('button#cancel-edit').click(function(ev) {
        toggleEditMode();
        $editForm[0].reset();
    });
    $editForm.find('button#delete-event').click(function(ev) {
        // TODO: show modal with confirmation
    });
    $("#delete-confirm").dialog({
        resizable:  false,
        height:     160,
        modal:      true,
        buttons: {
          "Delete event": function() {
            $(this).dialog("close");
          },
          Cancel: function() {
            $(this).dialog("close");
          }
        }
    });
    forms.setupImageUpload($editForm);

    var ac = new google.maps.places.Autocomplete(
            $editForm.find('input[name="address"]')[0], { types: ['geocode'] });
    google.maps.event.addListener(ac, 'place_changed', function() {
        var place = autocomplete.getPlace();
        var loc = { latitude:   place.geometry.location.lat(),
                    longitude:  place.geometry.location.lng() };
        for (var k in loc)
            $editForm.find('input[name="'+k+'"]').val(loc[k]);
    });
});
