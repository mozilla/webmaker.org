module.exports = function( make ) {
  return function( req, res ) {
    var username = req.session.username,
        page = req.param.page || 1,
        app = req.query.app,
        options = {};

    // MakeAPI doesn't handle undefined being passed for user. To
    // prevent the MakeAPI error showing when no signed in user accesses the page
    // I'm checking here first.
    if ( !username ) {
      res.render( "me.html", {
        page: "me",
        view: app || "webmaker"
      });
      return;
    }

    // Set up search options
    options.user = username;
    if ( app ) {
      options.contentType = "application/x-" + app;
    }

    make.find( options )
    .limit( 50 )
    .sortByField( "updatedAt", "desc" )
    .page( page )
    .process( function( err, data ) {
      if ( err ) {
        return res.send( err );
      }
      res.render( "me.html", {
        makes: data || [],
        page: "me",
        pagination: page,
        view: app || "webmaker",
        username: username
      });
    });
  };
};
