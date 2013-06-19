module.exports = function( make ){
  return {
    api: {
      healthcheck: require( "./api/healthcheck" )
    },
    details: require( "./details" )( make ),
    me: require( "./me" )( make ),
    page: function( view ) {
      return require( "./page" )( view );
    },
    remove: require( "./remove" )( make ),
    search: require( "./search" )( make ),
    tag: function( req, res ) {
      res.redirect( "/search?type=tags&q=" + req.params.tag );
    },
    user: require( "./user" ),
    usersearch: function( req, res ) {
      res.redirect( "/search?type=user&q=" + req.params.user );
    },
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
    }
  };
};
