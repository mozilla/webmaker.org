module.exports = function( make, makeURL, personaSSO, loginAPI ) {
  return function( req, res ) {
    var type = req.param( "type" ) || "tags",
        query = req.param( "q" ) || "featured",
        makeSize = req.param( "size" ),
        sortByField = req.param( "sortByField" ) || "createdAt",
        sortByOrder = req.param( "order" ) || "desc",
        page = req.param( "page" ) || 1,
        options = {};

    options[ type ] = query;

    make.find( options )
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
          searchType: type,
          makeEndpoint: makeURL,
          personaSSO: personaSSO,
          loginAPI: loginAPI,
          email: req.session.email || ''
        });
    });
  };
};
