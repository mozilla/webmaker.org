module.exports = {
  api: {
    healthcheck: require("./api/healthcheck")
  },
  details: require("./details"),
  gallery: require("./gallery"),
  include: function( transparent ) {
    return function( req, res ) {
      res.render( "sso/include.html", {
        transparent: transparent
      });
    };
  },
  includejs: function( hostname ) {
    return function( req, res ) {
      res.set( "Content-Type", "application/javascript;charset=utf-8" );
      res.render( "sso/include.js", {
        HOSTNAME: hostname
      });
    };
  },
  me: require("./me"),
  page: function( view ) {
    return require("./page")(view);
  },
  remove: require("./remove"),
  search: require("./search"),
  sitemap: require("./sitemap"),
  tag: function( req, res ) {
    res.redirect("/search?type=tags&q=" + req.params.tag);
  },
  user: require("./user"),
  usersearch: function( req, res ) {
    res.redirect( "/search?type=user&q=" + req.params.user );
  }
};
