module.exports = function( options ) {
  var Make = require( "makeapi" ).makeAPI( options ),
      moment = require( "moment" ),
      path = require( "path" );

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

  Make.process = function( callback ) {
    Make.then( function( err, data ) {
      var make;

      for ( var i = 0; i < data.length; i++ ) {
        make = data[ i ];

        // Convert tags and set the "make.type"
        make.tags = getTags( make.tags );
        if ( make.tags.guide ) {
          make.type = "guide";
        } else if ( make.contentType ) {
          make.type = make.contentType.replace( /application\/x\-/g, "" );
        }

        // Convert the created at and updated at to human time
        make.updatedAt = moment( data[i].updatedAt ).fromNow();
        make.createdAt = moment( data[i].createdAt ).fromNow();

        // Set the remix URL
        make.editurl = path.join( make.url, "/edit" );
        make.remixurl = path.join( make.url, "/remix" );
      }

      callback( err, data );
    });
  };

  return Make;
};


