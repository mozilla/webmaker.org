module.exports = function( make ) {
  return function( req, res ) {
    make.id( req.params.id ).process( function( err, data ) {
      var makeData = data[ 0 ];

      // Prep remixes, max of 5
      makeData.remixes( function( err, remixData) {
        makeData.remixCount = remixData.length;
        makeData.remixes = [];
        for ( var i = 0; i < Math.min( remixData.length, 5 ); i++ ) {
          makeData.remixes.push({
            url: remixData[ i ].url,
            username: remixData[ i ].username
          });
        }

        // Prep original source
        if ( makeData.remixedFrom ) {
          make.id( makeData.remixedFrom ).then( function( err, remixedFromData ) {
            makeData.remixedFromData = {};
            makeData.remixedFromData.url = remixedFromData[ 0 ].url;
            makeData.remixedFromData.username = remixedFromData[ 0 ].username;
            res.render( "details.html", makeData );
          });
        } else {
          res.render( "details.html", makeData );
        }
       });
    });
  };
};
