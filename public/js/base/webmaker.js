define(['jquery', 'uri', 'base/ui'],
  function ($, URI, UI ) {
  'use strict';

  var makeURL,
      page,
      make,
      setup = {};

  function getTags( tagList ) {
    var tag,
        obj = {};

    if ( !tagList ) {
      return obj;
    }

    for ( var i = 0; i < tagList.length; i++ ) {
      tag = tagList[ i ].split( ":" );
      if ( tag.length === 2 ) {
        obj[ tag[ 0 ] ] = tag[ 1 ];
      } else {
        obj[ tag[ 0 ] ] = true;
      }
    }
    return obj;
  }

  setup.template = function() {
    $( ".ui-code" ).each( function( i, el ) {
      var html = el.innerHTML;
      $( el ).text( html );
    });
    UI.select( '#select-test', function( val ) {
      console.log( val );
    });
  };

  setup.search = function() {
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
      $searchField.val( query.replace(/,/g,", ") );
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
  };

  setup.page = function( page ) {
    if ( setup[ page ] ) {
      setup[ page ]();
    }
  };

  var self = {
    init: function( options ) {
      makeURL = options.makeURL;
      page = options.page;
      make = Make({ apiURL: makeURL });
      setup.page( page );
    },
    doSearch: function( options, limit, each ) {
      var sortBy = 'createdAt',
          sortOrder = 'desc',
          options = options || {};

      if (options && options.title) {
        sortBy = 'title';
        sortOrder = 'asc';
      }

      make
      .find( options )
      .limit( limit )
      .sortByField( sortBy, sortOrder )
      .then( function( error, results ) {
        var result;
        for ( var i = 0; i < results.length; i++ ) {
          result = results[ i ];
          result.tags = getTags( result.tags );
          if ( each ) {
            each( result );
          }
        }

      });
    }
  };

  return self;
});
