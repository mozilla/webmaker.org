define(['jquery', 'domReady!'],
function ($) {

    $(window).resize(function() {
        $('main').height(
            $('body').height() - [
                'header', '#midbar', 'footer'
            ].map(function(s) { return $(s).height(); })
             .reduce(function(a, b) { return a + b }, 0));
    }).resize();

    setTimeout(scroll.bind(window, 0, 0), 100);

});
