requirejs.config({
  baseDir: '/js',
  paths: {
    'cookie': '/bower/cookie-js/cookie',
    'text': '/bower/text/text',
    'jquery': '/bower/jquery/jquery.min',
    'jquery-ui': '/bower/jquery-ui/ui/minified/jquery.ui.core.min',
    'jquery-ui.widget': '/bower/jquery-ui/ui/minified/jquery.ui.widget.min',
    'jquery-ui.position': '/bower/jquery-ui/ui/minified/jquery.ui.position.min',
    'jquery-ui.menu': '/bower/jquery-ui/ui/minified/jquery.ui.menu.min',
    'jquery-ui.autocomplete': '/bower/jquery-ui/ui/minified/jquery.ui.autocomplete.min',
    'jquery.powertip': '/js/lib/jquery.powertip',
    'moment': '/bower/moment/min/moment+langs.min',
    'social': '/js/lib/socialmedia',
    'uri': '/js/lib/uri',
    'tabzilla': 'https://mozorg.cdn.mozilla.net/tabzilla/tabzilla',
    'nunjucks': '/bower/nunjucks/browser/nunjucks-dev',
    'makeapi': '/bower/makeapi-client/src/make-api',
    'localized': '/bower/webmaker-i18n/localized',
    'languages': '/bower/webmaker-language-picker/js/languages',
    'list': '/bower/listjs/dist/list.min',
    'fuzzySearch': '/bower/list.fuzzysearch.js/dist/list.fuzzysearch.min',
    'masonry': '/bower/masonry/masonry',
    'outlayer': '/bower/outlayer',
    'get-size': '/bower/get-size',
    'get-style-property': '/bower/get-style-property',
    'eventie': '/bower/eventie',
    'doc-ready': '/bower/doc-ready',
    'eventEmitter': '/bower/eventEmitter',
    'matches-selector': '/bower/matches-selector',
    'webmaker-auth-client': '/bower/webmaker-auth-client',
    'analytics': '/bower/webmaker-analytics/analytics'
  },
  shim: {
    'tabzilla': ['jquery'],
    'sso-ux': ['jquery'],
    'jquery-ui': ['jquery'],
    'jquery-ui.widget': ['jquery-ui'],
    'jquery-ui.position': ['jquery-ui'],
    'jquery-ui.menu': ['jquery-ui'],
    'jquery-ui.autocomplete': ['jquery-ui', 'jquery-ui.widget', 'jquery-ui.position', 'jquery-ui.menu']
  }
});

require([
  'jquery',
  'base/cta',
  'base/marquee',
  'base/email-signup',
  'base/anchor-slide',
  'base/navigation',
  'base/webmaker-campaign',
  'languages',
  'base/login',
  'tabzilla',
], function ($, cta, Marquee, privacy, AnchorSlide, navigation, webmakerCampaign, languages) {
  'use strict';

  var $window = $(window);
  var $backToTop = $('.back-to-top');

  // Show and hide "Back To Top" trigger
  $window.scroll(function () {
    if ($window.scrollTop() > 100) {
      $backToTop.addClass('addMore');
    } else {
      $backToTop.removeClass('addMore');
    }
  });

  // Call this when the element is ready
  languages.ready({
    position: "top",
    arrow: "left"
  });

  // Attach navigation UI
  navigation();

  // Generate CTA bar in footer
  cta.attachToCTA();

  // Campaign
  webmakerCampaign({
    element: '.webmaker-campaign-header',
    campaignName: 'eoy-fundraising'
  });

  // Create Anchor Sliders
  $('a.anchor-slide').each(function () {
    new AnchorSlide(this);
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
