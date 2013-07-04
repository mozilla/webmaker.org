define(['jquery', 'uri', 'base/ui'],
  function ($, URI, UI ) {
  'use strict';

  var STICKY_REGEX = /^webmaker:p-(\d+)$/,
      STICKY_PREFIX = "webmaker:p-",
      STICKY_LIMIT = 12;

  var makeURL,
      page,
      make,
      retrieved = 0,
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

  setup.page = function( page ) {
    if ( setup[ page ] ) {
      setup[ page ]();
    }
  };

  var self = {
    init: function( options ) {
      makeURL = options.makeURL;
      page = options.page;
      make = new Make({ apiURL: makeURL });
      setup.page( page );
    },
    doSearch: function( options, limit, each, pageNo) {
      var sortBy = 'createdAt',
          sortOrder = 'desc',
          regularMakes = [];

      options = options || {};

      if (options.title) {
        sortBy = 'title';
        sortOrder = 'asc';
      }

      function extractStickyPriority( tags ) {
        var res;
        for ( var i = tags.length - 1; i >= 0; i-- ) {
          res = STICKY_REGEX.exec( tags[ i ] );
          if ( res ) {
            return +res[1];
          }
        }
      }

      function sortByPriority(data) {
        var sortedData = [],
            priorityIndex;
        for (var i=0; i<data.length; i++) {
          priorityIndex = extractStickyPriority(data[i].appTags) - 1;
          sortedData[priorityIndex] = data[i];
        }
        return sortedData;
      }


      function searchCallback( err, results, totalHits ) {
        var result,
            sortedMakes;

        sortedMakes = sortByPriority(results);
        for ( var i = 0; i < STICKY_LIMIT; i++ ) {
          result = sortedMakes[ i ] || regularMakes.shift();
          if ( result && each ) {
            result.tags = getTags( result.tags );
            each( result );
          }
        }
        for ( var j = 0; j < regularMakes.length; j++ ) {
          result = regularMakes[ j ];
          if ( result && each ) {
            result.tags = getTags( result.tags );
            each( result );
          }
        }
      }


      function search( isSticky ) {
        options.tagPrefix = [ STICKY_PREFIX, !isSticky ];
        options.limit = isSticky ? STICKY_LIMIT : limit;
        options.sortByField = [ sortBy, sortOrder ];
        options.page = isSticky ? 1 : pageNo;
        make
          .find(options)
          .then( function(err, data, totalHits) {
            if (err) {
              return;
            }
            if (isSticky) {
              searchCallback(err, data, totalHits);
            } else {
              regularMakes = data;
              if ( pageNo >= Math.ceil(totalHits/options.limit ) ) {
                $('.load-more').hide();
              }
              search("sticky");
            }
          });
      }
      search();
    }
  };

  return self;
});
