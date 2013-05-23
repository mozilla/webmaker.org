define(['jquery', 'base/webmaker', 'base/mediaGallery'],
  function ($, webmaker, mediaGallery) {
  'use strict';

  var $body = $('body');

  webmaker.init({
    page: $body[0].id,
    makeURL: $body.data('endpoint')
  });

  $body.on('click', '.search-trigger', function (ev) {
    $('html').animate({
      scrollTop: 0
    }, 300, function() {
      $('#search').addClass('on');
    });
  });

  mediaGallery.init(webmaker);
});
