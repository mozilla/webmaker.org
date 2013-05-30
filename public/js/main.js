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
      media.search( { 'tags': [ 'template' ] } );
    } );

    // Search
    var query = $( ".search-poster" ).attr( "data-query" ),
        queryKeys = URI.parse( window.location.href ).queryKey,
        $searchPoster = $( ".search-poster" ),
        $searchField = $( "#search-field" ),
        $searchFilter = $( "#search-type" ),
        $forkBtns = $( ".make-fork-btn" ),
        $userNameLinks = $( ".user-link" ),
        $nextBtn = $( ".next-page" ),
        $prevBtn = $( ".previous-page" );

    function onKeyDown() {
      $( "html, body" ).animate({ scrollTop: 0 }, 200 );
      $searchPoster.addClass( "focus" );
      $searchField.off( "keydown", onKeyDown );
    }

    $searchFilter.find( "li" ).click( function(){
      var $this = $( this ),
          type = $this.attr( "data-value" );
      $this = $( this );
      $searchFilter.find( "[name=type]" ).val( type );
      $searchFilter.find( "[data-selected] > span" ).attr( "class", "icon-" + type );
      $searchFilter.find( ".ui-on" ).removeClass( "ui-on" );
      $this.addClass( "ui-on" );
    });

    if ( query ) {
      $searchField.val( query );
      onKeyDown();
    } else {
      $searchField.on( "keydown", onKeyDown );
    }


    $forkBtns.click( function( e ) {
      e.stopPropagation();
    });

    $nextBtn.click( function( e ) {
      queryKeys.page = queryKeys.page ? parseInt( queryKeys.page, 10 ) + 1 : 2;
      window.location.search = $.param( queryKeys );
    });

    $prevBtn.click( function( e ) {
      queryKeys.page = queryKeys.page > 1 ? parseInt( queryKeys.page, 10 ) - 1 : 1;
      window.location.search = $.param( queryKeys );
    });

    $userNameLinks.click( function( e ) {
      queryKeys.page = 1;
      queryKeys.type = "user";
      queryKeys.q = this.getAttribute( "data-username" );
      window.location.search = $.param( queryKeys );
    });


    media.init();

    UI.select( '#search-filter', function( val ) {
      switch ( val ) {
        case 'recommended':
          media.search( {
            tags: [ 'featured', 'recommended' ],
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
