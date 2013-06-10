module.exports = function( make, makeURL, personaSSO, loginAPI ) {
  return function( req, res ) {
    var type = req.param( "type" ) || "title",
    query = req.param( "q" ) || "featured",
    makeSize = req.param( "size" ),
    sortByField = req.param( "sortByField" ) || "createdAt",
    sortByOrder = req.param( "order" ) || "desc",
    page = req.param( "page" ) || 1,
    username = req.session.username,
    options = {};

    if ( type === 'tags' ) {
      var tags = query.split(',');
      options.tags = [];
      if( tags.length === 1 ) { // try splitting with spaces, too
        tags = query.split(' ');
      }
      for (var i = 0, l = tags.length; i < l; i ++) {
        var tag = tags[i];
        // check for hashtag, remove
        if ( tag.charAt(0) === '#' ) {
          tag = tag.slice(1);
        }
        options.tags.push(tag);
      }
    }
    else {
      // check for '@', remove
      if ( query.charAt(0) === '@' ) {
        query = query.slice(1);
      }
      options[ type ] = query;
    }

    make.find( options )
    .limit( 12 )
    .sortByField( sortByField, sortByOrder )
    .page( page )
    .then( function( err, data ) {
      // Need to replace this with make results processing module
      for( var i=0; i<data.length;i++ ) {
        data[i].type = data[i].contentType.replace( /application\/x\-/g, "" );
      }
      res.render( "search.html", {
        csrf: req.session._csrf,
        currentUser: username,
        email: req.session.email || '',
        hasQuery: req.param( "q" ),
        loginAPI: loginAPI,
        makeEndpoint: makeURL,
        makes: data || [],
        makeSize: makeSize,
        page: "search",
        pagination: page,
        personaSSO: personaSSO,
        query: options[type],
        searchType: type
      });
    });
  };
};
