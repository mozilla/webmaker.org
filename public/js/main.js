define(['jquery','base/mediaGallery', 'base/ui'],
  function ($, MediaGallery, UI) {
  'use strict';

  var $body = $('body'),
      $search = $('#search'),
      media = new MediaGallery();

  $('.search-trigger').click( function( e ) {
    $search.toggleClass('on');
  });

  $('#bottom-search-btn').click( function( e ) {
    $('html, body').animate({
      scrollTop: 0
    }, 300, function() {
      $search.addClass('on');
    });
  });

  media.init();

  UI.select( '#search-filter', function( val ) {
    switch ( val ) {
      case "popcorn":
        media.search( { tags: [ "featured" ], contentType: "application/x-thimble" } );
        break;
    };
  });

  $search.on( 'submit', 'form', function( e ) {
    e.preventDefault();
    var search = $( e.target ).find( "[name=keyword]" ).val();
    media.search( { tags: [ search ] } );
  });

});
