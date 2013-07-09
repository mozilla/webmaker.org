if ( process.env.NEW_RELIC_HOME ) {
  require( 'newrelic' );
}

var express = require( "express" ),
    habitat = require( "habitat" ),
    helmet = require( "helmet" ),
    nunjucks = require( "nunjucks" ),
    path = require( "path" ),
    lessMiddleWare = require( "less-middleware" );

habitat.load();

var app = express(),
    env = new habitat(),
    nunjucksEnv = new nunjucks.Environment( new nunjucks.FileSystemLoader( path.join( __dirname, 'views' )), {
      autoescape: true
    }),
    NODE_ENV = env.get( "NODE_ENV" ),
    WWW_ROOT = path.resolve( __dirname, "public" );

// Initialize make client so it is available to other modules
require("./lib/makeapi")({
  apiURL: env.get( "MAKE_ENDPOINT" ),
  auth: env.get( "MAKE_AUTH" )
});

var routes = require("./routes");

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
    username: req.session.username|| '',
    csrf: req.session._csrf
  });
  next();
});

require( "webmaker-events" ).init( app, nunjucksEnv, lessMiddleWare, __dirname );

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

// Nunjucks
// This just uses nunjucks-dev for now -- middleware to handle compiling templates in progress
app.use( "/views", express.static(path.join( __dirname, "views" ) ) );
app.get( "/ext/js/nunjucks.js", function( req, res ) {
  res.sendfile( path.resolve( __dirname, "node_modules/nunjucks/browser/nunjucks-dev.js"));
});

app.use( app.router );
app.use( function( err, req, res, next) {
  if ( !err.status ) {
    err.status = 500;
  }
  res.status( err.status );
  res.render( 'error.html', { message: err.message, code: err.status });
});
app.use( function( req, res, next ) {
  res.status( 404 );
  res.render( 'error.html', { code: 404 });
});

require( "./lib/loginapi" )( app, {
  loginURL: env.get( "LOGINAPI" ),
  audience: env.get( "AUDIENCE" )
});

var middleware = require( "./lib/middleware" );

app.get( "/healthcheck", routes.api.healthcheck );

app.get( "/", routes.page( "index" ) );
app.get( "/editor", middleware.checkAdmin, routes.editor );
app.get( "/about", routes.page( "about" ) );
app.get( "/teach", routes.teach );
app.get( "/party", routes.page( "party" ) );
app.get( "/tools", routes.page( "tools" ) );
app.get( "/mentor", routes.page( "mentor" ) );
app.get( "/getinvolved", routes.page( "getinvolved" ) );
app.get( "/event-guides", routes.page( "event-guides" ) );
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

// Account
app.get( "/login", routes.user.login );
app.get( "/new", routes.user.newaccount );

app.get( "/t/:tag", routes.tag );
app.get( "/u/:user", routes.usersearch );

app.get( "/terms", routes.page( "terms" ) );
app.get( "/privacy", routes.page( "privacy" ) );

app.get( "/sso/include.js", routes.includejs( env.get( "HOSTNAME" ) ) );
app.get( "/sso/include.html", routes.include() );
app.get( "/sso/include-transparent.html", routes.include("transparent" ));
app.get( "/sitemap.xml", routes.sitemap);
app.get( "/js/make-api.js", function( req, res ) {
  res.sendfile( path.resolve( __dirname, "node_modules/makeapi-client/src/make-api.js" ) );
});

/**
 * Legacy Webmaker Redirects
 */
require( "./routes/redirect" )( app );

app.listen( env.get( "PORT" ), function() {
  console.log( "Server listening ( http://localhost:%d )", env.get( "PORT" ));
});
