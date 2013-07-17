define(['jquery', 'rails'],
function ($) {
    $('.toggle-featured').on('ajax:beforeSend', function(ev, xhr, status) {
        console.log(xhr);
    }).on('ajax:success', function(ev, xhr, status) {
        console.log(xhr);
        var featured = !!xhr.event.featured,
            $form = $(this);
        $form.find('button[name="featured"]').each(function() {
            var $b = $(this);
            var action = true == $b.val();
            console.log(action, featured);
            $b[featured ^ action ? 'removeClass':'addClass']('hidden');
        });
    });
});
