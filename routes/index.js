module.exports = function( makeEndpoint, personaSSO, loginAPI ){
  return {
    api: {
      healthcheck: require( "./api/healthcheck" )
    },
    page: function( view ) {
      return require( "./page" )( view, makeEndpoint, personaSSO, loginAPI );
    },
    includejs: function( hostname ) {
      return function( req, res ) {
        res.set( "Content-Type", "application/javascript;charset=utf-8" );
        res.render( "sso/include.js", {
          HOSTNAME: hostname
        });
      }
    },
    myprojects: function() {
      return function( req, res ) {
        console.log( req.session );
        res.render( "myprojects.html", { app: "thimble", makeEndpoint: makeEndpoint } );
      };
    }
  };
};
