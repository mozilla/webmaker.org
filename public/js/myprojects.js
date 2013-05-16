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
      username = document.getElementById( "username" ),
      projectList = document.getElementById( "projects" ),
      projectTemplate = document.querySelector( ".project" ),
      filterBtns = document.querySelectorAll( ".filter-btn" ),
      rightBtn = document.getElementById( "right-btn" ),
      leftBtn = document.getElementById( "left-btn" ),
      email,
      appContext,
      slideIndex = 0,
      page = 0,
      filters = {
        popcorn: false,
        thimble: false
      };


  function getParameterByName( name ) {
      name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
          results = regex.exec(location.search);
      return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  function createProject( data ) {
    var el = projectTemplate.cloneNode( true );
    el.style.display = "";
    el.classList.add( data.type + "-project" );
    el.querySelector( ".project-title" ).innerHTML = data.title;
    el.querySelector( ".project-updated" ).innerHTML = "Updated " + data.updated;
    el.querySelector( ".project-edit" ).href = data.edit;

    projectList.appendChild( el );
  }

  console.log( URI.parse( window.location ) );

  function getMakes() {
    make.email( email )
    .limit( 30 )
    .sortByField( "updatedAt", "desc" )
    .then( function ( err, results ) {
      var type,
          url;
      if ( results && results.hits ) {
        projectList.innerHTML = "";
        slideIndex = 0;
        for ( var i = 0; i < results.hits.length; i++ ) {
          type = results.hits[ i ].contentType;
          if ( !type ) {
            continue;
          }
          type = type.split( "application/x-" );
          if ( !type[ 1 ] ) {
            continue;
          }
          type = type[ 1 ];
          url = results.hits[ i ].url;
          if ( filters[ type ] ) {
            createProject({
              title: results.hits[ i ].title || url,
              edit: url + "/edit",
              type: type,
              view: url,
              thumbnail: results.hits[ i ].thumbnail || "",
              updated: moment( results.hits[ i ].updatedAt ).fromNow()
            });
          }
        }
      }
    });
  }

  function updateFilter( filter, val ) {
    if ( !val ) {
      // Toggle what exists
      val = filters[ filter ] ? "off" : "on";
    }

    if ( val === "on" ) {
      document.querySelector( "[data-filter=" + filter +  "]" ).classList.add( "on" );
      document.querySelector( "[data-filter=" + filter +  "]" ).classList.remove( "off" );
      filters[ filter ] = true;
    }
    else if ( val == "off" ) {
      document.querySelector( "[data-filter=" + filter +  "]" ).classList.add( "off" );
      document.querySelector( "[data-filter=" + filter +  "]" ).classList.remove( "on" );
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


  make = Make({ apiURL: document.body.getAttribute( "data-endpoint" ) });
  email = getParameterByName( "email" );
  appContext = getParameterByName( "app" ) || "";
  projectTemplate.parentNode.removeChild( projectTemplate );

  if ( email ) {
    username.innerHTML = email;
  }
  if ( appContext ) {
    updateFilter( appContext, "on" );
  } else {
    updateFilter( "popcorn", "on" );
    updateFilter( "thimble", "on" );
  }

  getMakes();

  for ( var i = 0; i < filterBtns.length; i++ ) {
    filterBtns[ i ].addEventListener( "click", function( e ) {
      var filterParam = this.getAttribute( "data-filter" );
      filters[ filterParam ] = !filters[ filterParam ];
      this.classList.toggle( "off" );
      this.classList.toggle( "on" );
      getMakes();
    }, false );
  }

  leftBtn.addEventListener( "click", function( e ) {
    if ( slideIndex === 0 ) {
      return;
    }
    slideIndex -= 1;
    console.log( slideIndex );
    slide();
  }, false );

  rightBtn.addEventListener( "click", function( e ) {
    slideIndex += 1;
    slide();
  }, false );

});
