module.exports = function( options ) {
  var Make = require( "makeapi" ).makeAPI( options ),
      moment = require( "moment" );

  Make.process = function( callback ) {
    Make.then( function( err, data, totalHits ) {
      if ( err ) {
        return callback( err );
      }

      if ( !Array.isArray( data ) ) {
        return callback( "There was no data returned" );
      }

      var make;

      for ( var i = 0; i < data.length; i++ ) {
        make = data[ i ];

        // Set the tool
        make.tool = make.contentType.replace( /application\/x\-/g, "" );

        // Convert tags and set the "make.type"
        if ( make.taggedWithAny( [ "guide" ] ) ) {
          make.type = "guide";
        } else if ( make.contentType ) {
          make.type = make.tool;
        }

        // Convert the created at and updated at to human time
        make.updatedAt = moment( data[i].updatedAt ).fromNow();
        make.createdAt = moment( data[i].createdAt ).fromNow();

        // Set the remix URL
        make.editurl = make.url + "/edit";
        make.remixurl = make.url + "/remix";
      }

      callback( err, data, totalHits );
    });
  };

  return Make;
};

