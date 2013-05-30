requirejs.config({
  paths: {
    'text': '../ext/js/text',
    'jquery': '../ext/js/jquery-1.9.1',
    'jquery.carousel': '../ext/js/jquery.carouFredSel-6.2.1',
    'moment': '../ext/js/moment',
    'tabzilla': 'https://www.mozilla.org/tabzilla/media/js/tabzilla',
    'uri': '../ext/js/uri'
  },
  shim: {
    'tabzilla': ['jquery'],
    'jquery.carousel': ['jquery']
  }
});

require(['jquery','base/carousel', 'base/webmaker', 'base/mediaGallery', 'base/privacy', 'base/ui', 'uri', 'tabzilla' ],
  function ( $, carousel, webmaker, MediaGallery, privacy, UI, URI ) {
  'use strict';
  $(document).ready(function() {
    var $body = $('body');

    webmaker.init({
      page: $body[0].id,
      makeURL: $body.data('endpoint')
    });

    var media = new MediaGallery(webmaker);

    media.init();

    UI.select( '#search-filter', function( val ) {
      switch ( val ) {
        case 'featured':
          media.search( { tags: [ 'featured' ] } );
          break;

        case 'popcorn':
          media.search( { tags: [ 'featured' ], contentType: 'application/x-popcorn' } );
          break;

        case 'thimble':
          media.search( { tags: [ 'featured' ], contentType: 'application/x-thimble' } );
          break;

        case 'user':
          media.search( { tags: [ 'featured' ],  sortByField: { "user" : "asc" } } );
          break;
      }
    });

    carousel.attachToCTA();
    carousel.attachToPartners();

    privacy.attach();
  });
});
