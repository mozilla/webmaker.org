module.exports = function( make, makeURL, personaSSO, loginAPI ) {
  return function( req, res ) {
    var query = req.param( "q" ) || "featured",
        makeSize = req.param( "size" ),
        sortByField = req.param( "sortByField" ) || "createdAt",
        sortByOrder = req.param( "order" ) || "desc",
        page = req.param( "page" ) || 1;

    make.find({ tags: query })
      .limit( 12 )
      .sortByField( sortByField, sortByOrder )
      .page( page )
      .then( function( err, data ) {
        res.render( "search.html", {
          makes: data || [],
          makeSize: makeSize,
          page: "search",
          pagination: page,
          query: req.param( "q" ),
          makeEndpoint: makeURL,
          personaSSO: personaSSO,
          loginAPI: loginAPI,
          email: req.session.email || ''
        });
    });
  };
};
