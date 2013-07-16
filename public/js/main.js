requirejs.config({
  baseDir:'/js',
  paths: {
    'text':             '/ext/js/text',
    'jquery':           '/ext/js/jquery-1.9.1',
    'jquery.carousel':  '/ext/js/jquery.carouFredSel-6.2.1',
    'moment':           '/ext/js/moment',
    'social':           '/ext/js/socialmedia',
    'uri':              '/ext/js/uri',
    'tabzilla': 'https://www.mozilla.org/tabzilla/media/js/tabzilla',
    // XXX: window.__loginAPI gets templated in server-side in layout.html
    'sso-ux':            window.__loginAPI + '/js/sso-ux',
    'nunjucks':         '/ext/js/nunjucks'
  },
  shim: {
    'tabzilla': ['jquery'],
    'jquery.carousel': ['jquery'],
    'sso-ux': ['jquery']
  }
});

require(['jquery','base/carousel', 'base/privacy', 'tabzilla', 'sso-ux'],
  function ($, carousel, privacy) {
    'use strict';
    var $html = $('html, body');
    var $window = $(window);
    var $backToTop = $('.backToTop');

    // set up CSRF handling
    var csrfToken = $('meta[name="X-CSRF-Token"]').attr('content');
    $.ajaxSetup({
      beforeSend: function(request) {
       request.setRequestHeader('X-CSRF-Token', csrfToken);
      }
    });

    //Footer
    $backToTop.on('click', function (e) {
      $html.animate({scrollTop : 0}, 500);
      return false;
    });
    $window.scroll(function() {
     if ($window.scrollTop() > 100) {
       $backToTop.addClass('addMore');
     } else {
       $backToTop.removeClass('addMore');
     }
    });
    carousel.attachToCTA();
    carousel.attachToPartners();
    privacy.attach();

    // Set up page-specific js
    var pageJS = $('#require-js').data('page');
    if (pageJS) {
      require([pageJS]);
    }
});
