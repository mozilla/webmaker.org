define(['jquery', 'rails'],
function ($) {
    $('.toggle-featured').on('ajax:success', function(ev, xhr, status) {
        console.log(xhr);
    }).on('ajax:beforeSend', function(ev, xhr, status) {
        X = xhr;
        xhr.setRequestHeader('accept', 'application/json');
        console.log(xhr);
    });
});
