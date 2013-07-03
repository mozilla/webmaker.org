requirejs.config({
  paths: {
    'text':             '/ext/js/text',
    'jquery':           '/ext/js/jquery-1.9.1',
    'jquery.carousel':  '/ext/js/jquery.carouFredSel-6.2.1',
    'moment':           '/ext/js/moment',
    'uri':              '/ext/js/uri',
    'tabzilla': 'https://www.mozilla.org/tabzilla/media/js/tabzilla',
    // XXX: window.__loginAPI gets templated in server-side in layout.html
    'sso-ux':            window.__loginAPI + '/js/sso-ux'
  },
  shim: {
    'tabzilla': ['jquery'],
    'jquery.carousel': ['jquery'],
    'sso-ux': ['jquery']
  }
});

require(['jquery','base/carousel', 'base/webmaker', 'base/mediaGallery', 'base/privacy', 'base/ui', 'uri', 'tabzilla', 'sso-ux' ],
  function ( $, carousel, webmaker, MediaGallery, privacy, UI, URI ) {
  'use strict';

  $(document).ready(function() {
    var $body = $('body');
    var pages = [ "index" ];

    if ( pages.indexOf( $body[0].id ) !== -1 ) {
       webmaker.init({
        page: $body[0].id,
        makeURL: $body.data('endpoint')
      });

      var media = new MediaGallery(webmaker);
      media.init();

      $( '.load-more' ).on( 'click', function ( e ) {
        media.loadMore();
      } );

      // set up proper search handlers for filter
      switch ( $body[0].id ) {
        case 'index':
          UI.select( '#search-filter', function( val ) {
            switch ( val ) {
              case 'featured':
                media.search( {
                tags: [{
                  tags: [ 'webmaker:featured' ]
                }],
                sortByField: { 'createdAt' : 'desc' }
              });
              break;

              case 'popcorn':
                media.search( {
                tags: [{
                  tags: [ 'webmaker:featured' ]
                }],
                sortByField: { 'createdAt' : 'desc' },
                contentType: 'application/x-popcorn'
              });
              break;

              case 'thimble':
                media.search({
                tags: [{
                  tags: [ 'webmaker:featured' ]
                }],
                sortByField: { 'createdAt' : 'desc' },
                contentType: 'application/x-thimble'
              });
              break;
            }
        });
        break;
      }
    }

    $('.backToTop').click(function(){
      $('html, body').animate({scrollTop : 0},500);
      return false;
    });

    var noTop = ["tools", "guides"];

    if ( noTop.indexOf( $body[0].id ) === -1 ) {
      $(window).scroll(function(){
       if ($(this).scrollTop() > 100) {
         $('.backToTop').addClass("addMore");
       } else {
         $('.backToTop').removeClass("addMore");
       }
      });
    }

    carousel.attachToCTA();
    carousel.attachToPartners();

    privacy.attach();

    if ( $body[0].id === 'index' ) {
      navigator.idSSO.app.onlogin = function(loggedInUser, displayName) {
        $('.internal').hide();
        media.layout();
      };
    }
  });
});
