requirejs.config({
  baseDir: '/js',
  paths: {
    'analytics': '/bower_components/webmaker-analytics/analytics',
    'jquery': '/bower_components/jquery/jquery.min',
    'languages': '/bower_components/webmaker-language-picker/js/languages',
    'list': '/bower_components/listjs/dist/list.min',
    'fuzzySearch': '/bower_components/list.fuzzysearch.js/dist/list.fuzzysearch.min',
    'magnific-popup': '/bower_components/magnific-popup/dist/jquery.magnific-popup.min',
    'transition': '/bower_components/bootstrap/js/transition',
    'tabzilla': 'https://mozorg.cdn.mozilla.net/tabzilla/tabzilla',
    'selectize': '/bower_components/selectize/dist/js/standalone/selectize.min',
    'collapse': '/bower_components/bootstrap/js/collapse',
    'carousel': '/bower_components/bootstrap/js/carousel'
  },
  shim: {
    'transition': ['jquery'],
    'collapse': ['jquery'],
    'carousel': ['jquery'],
    'tabzilla': ['jquery']
  }
});

require([
  'jquery',
  'analytics',
  'languages',
  'selectize',
  'transition',
  'collapse',
  'carousel',
  'magnific-popup',
  'tabzilla'
], function ($, analytics, languages) {
  'use strict';
  var TIME_DELAYED_REDIRECT = 500; // in milliseconds
  // analytics
  var delayRedirect = function (url) {
    setTimeout(function () {
      window.location.href = url;
    }, TIME_DELAYED_REDIRECT);
  };
  $('.try-the-open-beta-btn').click(function (event) {
    event.preventDefault();
    analytics.event('Try the Open Beta');
    delayRedirect($(this).attr('href'));
  });
  $('#moi-video-play-btn').click(function () {
    analytics.event('Play Video', {
      label: 'MOI Partner Opportunity'
    });
  });
  $('.report-links').click(function (event) {
    event.preventDefault();
    analytics.event('Download Report', {
      label: $(this).data('report-name')
    });
    delayRedirect($(this).attr('href'));
  });
  $('#mobile-webmaker-partners-link').click(function () {
    event.preventDefault();
    analytics.event('Click on Partner with Us PDF link');
    delayRedirect($(this).attr('href'));
  });
  // video lightbox
  $('.moi-video-link').magnificPopup({
    type: 'iframe'
  });
  // quote carousel
  $('#quote-carousel').carousel();
  // smooth scrolling to anchors. modified from http://css-tricks.com/snippets/jquery/smooth-scrolling/
  $('.go-to-anchor-btn').click(function () {
    if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') &&
      location.hostname === this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top
        }, 600);
        return false;
      }
    }
  });
  var $element = $('#langPicker');
  var options = [];
  var lang;
  var config = window.angularConfig;
  for (var i = 0; i < config.supported_languages.length; i++) {
    lang = config.supported_languages[i];
    options.push({
      id: lang,
      title: config.langmap[lang] ? config.langmap[lang].nativeName : lang,
      english: config.langmap[lang] && config.langmap[lang].englishName
    });
  }
  $element.selectize({
    options: options,
    labelField: 'title',
    valueField: 'id',
    searchField: ['title', 'english'],
    onItemAdd: function (selectedLang) {
      if (selectedLang) {
        var href = window.location.pathname;
        var lang = config.lang;
        var supportedLanguages = config.supported_languages;

        // matches any of these:
        // `en`, `en-us`, `en-US` or `ady`
        var matchesLang;
        var matches = href.match(/([a-z]{2,3})([-]([a-zA-Z]{2}))?/);
        if (matches) {
          if (matches[1] && matches[2]) {
            matchesLang = matches[1].toLowerCase() + matches[2].toUpperCase();
          } else {
            matchesLang = matches[1].toLowerCase();
          }
        }
        // if the selected language is match to the language in the header
        if (selectedLang === lang) {
          return;
          // check if we have any matches and they are exist in the array we have
        } else if ((matches && matches[0]) && supportedLanguages.indexOf(matchesLang) !== -1) {
          href = href.replace(matches[0], selectedLang);
          window.location = href;
        } else if (href === '/') {
          window.location = '/' + selectedLang;
        } else {
          window.location = '/' + selectedLang + href;
        }
      }
    }
  });
  var selectize = $element[0].selectize;
  selectize.setValue(config.lang);
});
