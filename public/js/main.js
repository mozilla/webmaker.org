define(['jquery', 'jquery-carousel', 'base/carousel', 'base/webmaker', 'base/mediaGallery', 'base/privacy', 'base/ui'],
  function ($, $carousel, carousel, webmaker, MediaGallery, privacy, UI) {
  'use strict';
  $(document).ready(function() {
    var $body = $('body'),
    $search = $('#search'),
    media = new MediaGallery();

    $('#bottom-search-btn').click( function( e ) {
      $('html, body').animate({
        scrollTop: 0
      }, 300, function() {
        $search.addClass('on');
        $('#search-keyword').focus();
      });
    });

    media.init();

    UI.select( '#search-filter', function( val ) {
      switch ( val ) {
        case 'recent':
        case 'title':
          media.search( { title: true } );
          break;

        default:
          media.search( { tags: [val], contentType: 'application/x-thimble' } );
          break;
      }
    });

    carousel.attachToCTA();
    carousel.attachToPartners();

    privacy.attach();
  });
  });
