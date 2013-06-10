module.exports = function( make, makeURL, personaSSO, loginAPI ) {
  return function( req, res ) {
    var username = req.session.username,
        page = req.param.page || 1;

    if ( !username ) {
      res.send( "Oops...you are not signed in :(" );
    } else {
      make.user( username )
      .limit( 50 )
      .sortByField( "updatedAt", "desc" )
      .page( page )
      .process( function( err, data ) {
        if ( err ) {
          res.send( err );
          return;
        }

        res.render( "me.html", {
          avatar: req.session.avatar,
          csrf: req.session._csrf,
          email: req.session.email || '',
          loginAPI: loginAPI,
          makeEndpoint: makeURL,
          makes: data || [],
          page: "me",
          pagination: page,
          personaSSO: personaSSO,
          view: req.query.app || "webmaker",
          username: username
        });
      });
    }
  };
};
