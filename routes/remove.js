module.exports = function( make ) {
  return function( req, res ) {
    var id = req.body.makeID;

    make.id( id ).then( function( err, data ) {
      if ( err ) {
        return res.send( err );
      }

      var username = data[0].username;

      if ( username === req.session.username ) {
        make.remove( id, function( err, data ) {
          if ( err ) {
            res.send( err );
          } else {
            res.json( data );
          }
        });
      }
      else {
        res.send( "Sorry, looks like you don't have permission to delete this make :(" );
      }
    });
  };
};
