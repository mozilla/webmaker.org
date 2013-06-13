if ( process.env.NEW_RELIC_HOME ) {
  require( 'newrelic' );
}

var express = require( "express" ),
    habitat = require( "habitat" ),
    helmet = require( "helmet" ),
    nunjucks = require( "nunjucks" ),
    path = require( "path" ),
    persona = require( "express-persona" ),
    route = require( "./routes" ),
    lessMiddleWare = require( "less-middleware" ),
    makeAPI = require( "./lib/makeapi-webmaker" );

habitat.load();

var app = express(),
    env = new habitat(),
    nunjucksEnv = new nunjucks.Environment( new nunjucks.FileSystemLoader( path.join( __dirname, 'views' ))),
    make = makeAPI({
      apiURL: env.get( "MAKE_ENDPOINT" ),
      auth: env.get( "MAKE_AUTH" )
    }),
    routes = route( make ),
    NODE_ENV = env.get( "NODE_ENV" ),
    WWW_ROOT = path.resolve( __dirname, "public" );

nunjucksEnv.express( app );
app.disable( "x-powered-by" );

app.use( express.logger( NODE_ENV === "development" ? "dev" : "" ) );
if ( !!env.get( "FORCE_SSL" ) ) {
  app.use( helmet.hsts() );
  app.enable( "trust proxy" );
}
app.use( express.compress() );
app.use( express.static( path.join( __dirname, "public" )));
app.use( express.bodyParser() );
app.use( express.cookieParser() );
app.use( express.cookieSession({
  key: "webmaker.sid",
  secret: env.get( "SESSION_SECRET" ),
  cookie: {
    maxAge: 2678400000, // 31 days. Persona saves session data for 1 month
    secure: !!env.get( "FORCE_SSL" )
  },
  proxy: true
}));
app.use( express.csrf() );

app.locals({
  makeEndpoint: env.get( "MAKE_ENDPOINT" ),
  personaSSO: env.get( "AUDIENCE" ),
  loginAPI: env.get( "LOGIN" ),
  ga_account: env.get( "GA_ACCOUNT" ),
  ga_domain: env.get( "GA_DOMAIN" )
});

app.use(function( req, res, next ) {
  res.locals({
    email: req.session.email || '',
    webmakerID: req.session.webmakerid || '',
    csrf: req.session._csrf
  });
  next();
});

require( "webmaker-events" ).init( app, nunjucksEnv, lessMiddleWare, __dirname );

app.use( app.router );

var optimize = NODE_ENV !== "development",
    tmpDir = path.join( require( "os" ).tmpDir(), "mozilla.webmaker.org" );
app.use( lessMiddleWare({
  once: optimize,
  debug: !optimize,
  dest: tmpDir,
  src: WWW_ROOT,
  compress: optimize,
  yuicompress: optimize,
  optimization: optimize ? 0 : 2
}));
app.use( express.static( tmpDir ) );

app.get( "/healthcheck", routes.api.healthcheck );

app.get( "/", routes.page( "index" ) );
app.get( "/about", routes.page( "about" ) );
app.get( "/learn", routes.page( "learn" ) );
app.get( "/teach", routes.page( "teach" ) );
app.get( "/party", routes.page( "party" ) );
app.get( "/tools", routes.page( "tools" ) );
app.get( "/mentor", routes.page( "mentor" ) );
app.get( "/getinvolved", routes.page( "getinvolved" ) );
app.get( "/guides", routes.page( "guides" ) );
app.get( "/search", routes.search );

app.get( "/details", routes.details );
// Old
app.get( "/details/:id", function(req,res) {
  res.redirect("/details?id=" + req.params.id);
});

app.get( "/me", routes.me );
// Old
app.get( "/myprojects", routes.me );
app.post( "/remove", routes.remove );

app.get( "/t/:tag", routes.tag );
app.get( "/u/:user", routes.user );

app.get( "/template", routes.page( "template" ) );
app.get( "/terms", routes.page( "terms" ) );

app.get( "/sso/include.js", routes.includejs( env.get( "HOSTNAME" ) ) );


/**
 * WEBMAKER SSO
 */
// LoginAPI helper Module
var loginAPI = require( "webmaker-loginapi" )( app, env.get( "LOGINAPI" ) );

persona(app, { audience: env.get( "AUDIENCE" ) } );
/**
 * END WEBMAKER SSO
 */

app.listen( env.get( "PORT" ), function() {
  console.log( "Server listening ( http://localhost:%d )", env.get( "PORT" ));
});
