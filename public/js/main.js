requirejs.config({
  baseDir:'/js',
  paths: {
    'text':             '/bower/text/text',
    'jquery':           '/bower/jquery/jquery.min',
    'jquery.powertip':  '/js/lib/jquery.powertip',
    'moment':           '/bower/moment/moment',
    'social':           '/js/lib/socialmedia',
    'uri':              '/js/lib/uri',
    'tabzilla':         'https://www.mozilla.org/tabzilla/media/js/tabzilla',
    // XXX: window.__loginAPI gets templated in server-side in layout.html
    'sso-ux':            window.__loginAPI + '/js/sso-ux',
    'nunjucks':         '/js/lib/nunjucks',
    'makeapi':          '/bower/makeapi-client/src/make-api'
  },
  shim: {
    'tabzilla': ['jquery'],
    'sso-ux': ['jquery']
  }
});

require(['jquery','base/cta', 'base/marquee', 'base/email-signup', 'tabzilla', 'sso-ux'],
  function ($, cta, Marquee, privacy) {
    'use strict';
    var $html = $('html, body');
    var $window = $(window);
    var $backToTop = $('.backToTop');

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

    cta.attachToCTA();

    // Create Partner marquees
    if ($('ul.sponsors').length) {
      $('ul.sponsors').each(function () {
        var marquee = new Marquee(this);
        marquee.startRotation();
      });
    }

    // Set up page-specific js
    var pageJS = $('#require-js').data('page');
    if (pageJS) {
      require([pageJS]);
    }
});
