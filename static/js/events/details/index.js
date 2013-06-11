define(['jquery', 'forms', 'domReady!'],
function ($, forms) {
    var $editForm = $('form#edit-event');
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
});
