requirejs.config({
  baseDir: '/js',
  paths: {
    'cookie-js': '/bower_components/cookie-js',
    'text': '/bower_components/text/text',
    'jquery': '/bower_components/jquery/jquery.min',
    'jquery-ui': '/bower_components/jquery-ui/ui/minified/jquery.ui.core.min',
    'jquery-ui.widget': '/bower_components/jquery-ui/ui/minified/jquery.ui.widget.min',
    'jquery-ui.position': '/bower_components/jquery-ui/ui/minified/jquery.ui.position.min',
    'jquery-ui.menu': '/bower_components/jquery-ui/ui/minified/jquery.ui.menu.min',
    'jquery-ui.autocomplete': '/bower_components/jquery-ui/ui/minified/jquery.ui.autocomplete.min',
    'jquery.powertip': '/js/lib/jquery.powertip',
    'moment': '/bower_components/moment/min/moment+langs.min',
    'social': '/js/lib/socialmedia',
    'selectize': "/bower_components/selectize/dist/js/standalone/selectize.min",
    'uri': '/js/lib/uri',
    'tabzilla': 'https://mozorg.cdn.mozilla.net/tabzilla/tabzilla',
    'nunjucks': '/bower_components/nunjucks/browser/nunjucks',
    'makeapi': '/bower_components/makeapi-client/src/make-api',
    'localized': '/bower_components/webmaker-i18n/localized',
    'languages': '/bower_components/webmaker-language-picker/js/languages',
    'list': '/bower_components/listjs/dist/list.min',
    'fuzzySearch': '/bower_components/list.fuzzysearch.js/dist/list.fuzzysearch.min',
    'masonry': '/bower_components/masonry/masonry',
    'outlayer': '/bower_components/outlayer',
    'get-size': '/bower_components/get-size',
    'get-style-property': '/bower_components/get-style-property',
    'eventie': '/bower_components/eventie',
    'doc-ready': '/bower_components/doc-ready',
    'eventEmitter': '/bower_components/eventEmitter',
    'matches-selector': '/bower_components/matches-selector',
    'analytics': '/bower_components/webmaker-analytics/analytics',
    'url-template': '/bower_components/url-template/lib/url-template'
  },
  shim: {
    'tabzilla': ['jquery'],
    'sso-ux': ['jquery'],
    'jquery-ui': ['jquery'],
    'jquery-ui.widget': ['jquery-ui'],
    'jquery-ui.position': ['jquery-ui'],
    'jquery-ui.menu': ['jquery-ui', 'jquery-ui.widget'],
    'jquery-ui.autocomplete': ['jquery-ui', 'jquery-ui.widget', 'jquery-ui.position', 'jquery-ui.menu']
  }
});

require([
  'jquery',
  'base/marquee',
  'base/email-signup',
  'base/anchor-slide',
  'base/navigation',
  'base/webmaker-campaign',
  'languages',
  'selectize',
  'base/login',
  'tabzilla',
], function ($, Marquee, privacy, AnchorSlide, navigation, webmakerCampaign, languages, selectize) {
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

  $('#supportedLocales').selectize();

  // Attach navigation UI
  navigation();

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
