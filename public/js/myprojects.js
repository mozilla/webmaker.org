require.config({
  paths: {
    'jquery': '../ext/js/jquery-1.9.1',
    'moment': '../ext/js/moment',
    'uri': '../ext/js/uri'
  },
  shim: {
    'jquery': {
      exports: 'jQuery'
    }
  }
});

require(['jquery', 'moment', 'uri'],
  function ($, moment, URI) {
  'use strict';

  var make,
      $username = $( "#username" ),
      $projectList = $( "#projects" ),
      $projectTemplate = $( "#myprojects .project" ),
      $filterBtns = $( "#myprojects .filter-btn" ),
      $rightBtn = $( "#right-btn" ),
      $leftBtn = $( "#left-btn" ),
      queryKeys,
      email,
      appContext,
      slideIndex = 0,
      page = 0,
      filters = {
        popcorn: false,
        thimble: false
      };

  function createProject( data ) {
    var $el = $projectTemplate.clone( true );
    $el.css( "display", "" );
    $el.addClass( data.type + "-project" );
    $el.find( ".project-title" ).html( data.title );
    $el.find( ".project-updated" ).html( "Updated " + data.updated );
    $el.find( ".project-edit" ).attr( "href", data.edit );

    $projectList.append( $el );
  }

  function getMakes() {
    make.email( email )
    .limit( 30 )
    .sortByField( "updatedAt", "desc" )
    .then( function ( err, results ) {
      var type,
          url;
      if ( err ) {
        return err;
      }
      if ( results ) {
        $projectList.empty();
        slideIndex = 0;
        for ( var i = 0; i < results.length; i++ ) {
          type = results[ i ].contentType;
          if ( !type ) {
            continue;
          }
          type = type.split( "application/x-" );
          if ( !type[ 1 ] ) {
            continue;
          }
          type = type[ 1 ];
          url = results[ i ].url;
          if ( filters[ type ] ) {
            createProject({
              title: results[ i ].title || url,
              edit: url + "/edit",
              type: type,
              view: url,
              thumbnail: results[ i ].thumbnail || "",
              updated: moment( results[ i ].updatedAt ).fromNow()
            });
          }
        }
      }
    });
  }

  function updateFilter( filter, val ) {
    var dataFilter = "[data-filter=" + filter +  "]";
    if ( !val ) {
      // Toggle what exists
      val = filters[ filter ] ? "off" : "on";
    }

    if ( val === "on" ) {
      $( dataFilter ).addClass( "ui-toggle-on" );
      $( dataFilter ).removeClass( "ui-toggle-off" );
      filters[ filter ] = true;
    }
    else if ( val == "off" ) {
      $( dataFilter ).addClass( "ui-toggle-off" );
      $( dataFilter ).removeClass( "ui-toggle-on" );
      filters[ filter ] = false;
    }

  }

  function slide() {
    var projects = document.querySelectorAll( ".project" );
    for ( var i = 0; i < projects.length; i++ ) {
      if ( i < slideIndex ) {
        projects[ i ].style.width = "0";
      } else {
        projects[ i ].style.width = "";
      }
    }
  }

  make = new Make({ apiURL: document.body.getAttribute( "data-endpoint" ) });
  queryKeys = URI.parse( window.location.href.replace( /@/g, "%3D" ) ).queryKey;
  email = queryKeys.email.replace( /\%3D/g, "@" ) || "";
  appContext = queryKeys.app || false;

  $projectTemplate.remove();

  $username.text( email );

  if ( appContext ) {
    updateFilter( appContext, "on" );
  } else {
    updateFilter( "popcorn", "on" );
    updateFilter( "thimble", "on" );
  }

  getMakes();

  $filterBtns.click( function( e ) {
    var $this = $( this ),
        filterParam = $this.attr( "data-filter" );
    filters[ filterParam ] = !filters[ filterParam ];
    $this.toggleClass( "ui-toggle-off" );
    $this.toggleClass( "ui-toggle-on" );
    getMakes();
  });

  $leftBtn.click( function( e ) {
    if ( slideIndex === 0 ) {
      return;
    }
    slideIndex -= 1;
    slide();
  });

  $rightBtn.click( function( e ) {
    slideIndex += 1;
    slide();
  });

});
