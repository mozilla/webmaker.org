module.exports = function(req, res) {
  var make = require("../lib/makeapi"),
      querystring = require("querystring");

  var DEFAULT_TYPE = "tags",
      DEFAULT_QUERY = "webmaker:featured",
      VALID_TYPES = [
        "tags",
        "title",
        "user",
        "description"
      ],
      VALID_CONTENT_TYPES = [
        "application/x-thimble",
        "application/x-popcorn"
      ];

  var type = ( req.query.type || DEFAULT_TYPE ).toString(),
      query = ( req.query.q || DEFAULT_QUERY ).toString(),
      contentType = ( req.query.contentType || '' ).toString(),
      sortByField = ( req.query.sortByField || "createdAt" ).toString(),
      sortByOrder = ( req.query.order || "desc" ).toString(),
      page = ( req.query.page || 1 ).toString(),
      options = {};

  if ( VALID_TYPES.indexOf( type ) === -1 ) {
    type = DEFAULT_TYPE;
  }

  if ( type === 'tags' ) {
    var tags = query.split(',');
    options.tags = [];
    options.tags[0] = tags.map(function( t ) {
      // check for hashtag, remove
      t = t.trim();
      if ( t[0] === '#' ) {
        return t.slice(1);
      }
      return t;
    });
  }
  else {
    // check for '@', remove
    if ( query[0] === '@' ) {
      query = query.slice(1);
    }
    options[ type ] = query;
  }

  if ( contentType ) {
    var cleanCT = querystring.unescape( contentType );
    if ( VALID_CONTENT_TYPES.indexOf( contentType ) !== -1 ) {
      options.contentType = cleanCT;
    }
  }

  var limit = 12;

  make.find( options )
  .limit( limit )
  .sortByField( sortByField, sortByOrder )
  .page( page )
  .process( function( err, data, totalHits ) {
    if( err ) {
      return res.send(err);
    }
    // query can be an array of tags sometimes,
    // so force a string so that it's autoescaped
    var query = options[type].toString();
    var showOlder = ( totalHits > page * limit );

    res.render( "search.html", {
      hasQuery: !!req.query.q,
      makes: data || [],
      page: "search",
      pagination: page,
      query: query,
      searchType: type,
      showOlder: showOlder
    });
  });
};
