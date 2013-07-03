module.exports = function( make ) {
  return function( req, res ) {

    make
    .tags(['webmaker:recommended', 'guide'])
    .limit( 12 )
    .sortByField( "createdAt", "desc" )
    .process( function( err, data, totalHits ) {
      if ( err ) {
        return res.send( err );
      }
      res.render( "teach.html", {
        makes: data || [],
        page: "teach"
      });
    });
  };
};
