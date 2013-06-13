requirejs.config({
  baseUrl: '/js',
  paths: {
    'text':             '/ext/js/text',
    'jquery':           '/ext/js/jquery-1.9.1',
    'jquery.carousel':  '/ext/js/jquery.carouFredSel-6.2.1',
    'moment':           '/ext/js/moment',
    'social':           '/ext/js/socialmedia',
    'uri':              '/ext/js/uri',
    'tabzilla':         'https://www.mozilla.org/tabzilla/media/js/tabzilla'
  },
  shim: {
    'tabzilla': ['jquery'],
    'jquery.carousel': ['jquery']
  }
});

require(['jquery','base/carousel', 'base/privacy', 'tabzilla' ],
  function ( $, carousel, privacy ) {
    "use strict";

    // set up CSRF handling
    var csrfToken = $("meta[name='X-CSRF-Token']").attr("content");
    $.ajaxSetup({
      beforeSend: function(request) {
       request.setRequestHeader("X-CSRF-Token", csrfToken);
      }
    });

    //Footer
    $("#bottom-search-btn").on("click", function (e) {
      document.getElementById("webmaker-nav").scrollIntoView();
    });
    carousel.attachToCTA();
    carousel.attachToPartners();
    privacy.attach();
});
