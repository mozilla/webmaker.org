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
    'nunjucks':         '/bower/nunjucks/browser/nunjucks-dev',
    'makeapi':          '/bower/makeapi-client/src/make-api',
    'localized':        '/bower/webmaker-i18n/localized'
  },
  shim: {
    'tabzilla': ['jquery'],
    'sso-ux': ['jquery']
  }
});

require(['jquery', 'base/cta', 'base/marquee', 'base/email-signup', 'base/anchor-slide', 'tabzilla', 'sso-ux'],
  function ($, cta, Marquee, privacy, AnchorSlide) {
    'use strict';

    var $html = $('html, body');
    var $window = $(window);
    var $backToTop = $('.back-to-top');

    // Show and hide "Back To Top" trigger
    $window.scroll(function() {
     if ($window.scrollTop() > 100) {
       $backToTop.addClass('addMore');
     } else {
       $backToTop.removeClass('addMore');
     }
    });

    // Generate CTA bar in footer
    cta.attachToCTA();

    // Create Anchor Sliders
    $('a.anchor-slide').each(function () {
      var anchorSlide = new AnchorSlide(this);
    });

    // Create Partner marquees
    $('ul.sponsors').each(function () {
      var marquee = new Marquee(this);
      marquee.startRotation();
    });

    // Set up page-specific js
    var pageJS = $('#require-js').data('page');

    if (pageJS) {
      require([pageJS]);
    }
});
