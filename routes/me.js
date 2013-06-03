module.exports = function( make, makeURL, personaSSO, loginAPI ) {
  var moment = require( "moment" );
  return function( req, res ) {
    var username = req.session.webmakerid,
        page = req.param.page || 1;

    if ( !username ) {
      res.send( "Oops...you are not signed in :(" );
    } else {
      make.user( username )
      .limit( 50 )
      .sortByField( "updatedAt", "desc" )
      .page( page )
      .then( function( err, data ) {
        for(var i=0; i<data.length;i++) {
          data[i].type = data[i].contentType.replace( /application\/x\-/g, "" );
          data[i].updatedAt = moment.unix( data[i].updatedAt ).fromNow();
        }
        res.render( "me.html", {
          page: "me",
          makes: data || [],
          pagination: page,
          makeEndpoint: makeURL,
          personaSSO: personaSSO,
          loginAPI: loginAPI,
          username: username,
          avatar: req.session.avatar,
          email: req.session.email || ''
        });
      });
    }
  };
};
