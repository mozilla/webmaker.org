define(['jquery', 'forms', 'domReady!'],
function ($, forms, google) {
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
    });
    $editForm.find('button#delete-event').click(function(ev) {
        // TODO: show modal with confirmation
    });
    forms.setupAddressField($editForm);
    forms.setupImageUpload($editForm);
});
