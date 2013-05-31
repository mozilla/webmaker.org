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

    $('#template').on('click', function( e ) {
      media.search( { tags: [ 'template' ] } );
    } );

    media.init();

    UI.select( '#search-filter', function( val ) {
      switch ( val ) {
        case 'recommended':
          media.search( {
            tags: [ 'recommended' ],
            sortByField: { 'createdAt' : 'desc' }
          } );
          break;

        case 'featured':
          media.search( {
            tags: [ 'featured' ],
            sortByField: { 'createdAt' : 'desc' }
          } );
          break;

        case 'popcorn':
          media.search( {
            tags: [ 'featured' ],
            sortByField: { 'createdAt' : 'desc' },
            contentType: 'application/x-popcorn'
          } );
          break;

        case 'thimble':
          media.search( {
            tags: [ 'featured' ],
            sortByField: { 'createdAt' : 'desc' },
            contentType: 'application/x-thimble'
          } );
          break;

        case 'guide':
          media.search( {
            tags: [ 'featured', 'guide' ],
            sortByField: { 'createdAt' : 'desc' },
            contentType: 'application/x-thimble'
          } );
          break;
      }
    });

    carousel.attachToCTA();
    carousel.attachToPartners();

    privacy.attach();
  });
});
