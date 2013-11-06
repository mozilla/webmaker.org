module.exports = function (req, res) {
  var make = require("../lib/makeapi"),
    querystring = require("querystring");

  var DEFAULT_TYPE = "tags",
    DEFAULT_QUERY = "webmaker:featured",
    VALID_TYPES = [
      "all",
      "tags",
      "title",
      "user",
      "description"
    ],
    VALID_CONTENT_TYPES = [
      "application/x-thimble",
      "application/x-popcorn"
    ];

  var type = (req.query.type || DEFAULT_TYPE).toString(),
    contentType = (req.query.contentType || '').toString(),
    sortByField = (req.query.sortByField || "createdAt").toString(),
    sortByOrder = (req.query.order || "desc").toString(),
    page = (req.query.page || 1).toString(),
    setToAll = !(req.query.type || req.query.q ||
      req.query.contentType || req.query.sortByField ||
      req.query.order || req.query.page),
    options = {},
    query,
    hideNamespace = false;

  if (!req.query.q) {
    query = DEFAULT_QUERY;
    hideNamespace = true;
  } else {
    query = req.query.q.toString();
  }

  if (VALID_TYPES.indexOf(type) === -1) {
    type = DEFAULT_TYPE;
  }

  if (type === 'all') {
    make.or();
    options.title = options.user = options.description = query;
  }

  if (type === 'all' || type === 'tags') {
    var tags = query.split(',');
    options.tags = [];
    options.tags[0] = tags.map(function (t) {
      return t.trim();
    });
  } else {
    // check for '@', remove
    if (query[0] === '@') {
      query = query.slice(1);
    }
    options[type] = query;
  }

  if (contentType) {
    var cleanCT = querystring.unescape(contentType);
    if (VALID_CONTENT_TYPES.indexOf(contentType) !== -1) {
      options.contentType = cleanCT;
    }
  }

  var limit = 12;
  make.find(options)
    .limit(limit)
    .sortByField(sortByField, sortByOrder)
    .page(page)
    .process(function (err, data, totalHits) {
      if (err) {
        return res.send(err);
      }
      // query can be an array of tags sometimes,
      // so force a string so that it's autoescaped
      var query = type === "all" ? options.title.toString() : options[type].toString(),
        showOlder = (totalHits > page * limit);

      if (hideNamespace) {
        query = "featured";
      }

      res.render("search.html", {
        hasQuery: !! req.query.q,
        makes: data || [],
        page: "search",
        pagination: page,
        totalHits: totalHits,
        limit: limit,
        query: query,
        searchType: type,
        searchIcon: setToAll ? "all" : type
      });
    });
};
