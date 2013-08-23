if ( process.env.NEW_RELIC_HOME ) {
  require( 'newrelic' );
}

var express = require( "express" ),
    domain = require( "domain" ),
    cluster = require( "cluster" ),
    habitat = require( "habitat" ),
    helmet = require( "helmet" ),
    nunjucks = require( "nunjucks" ),
    path = require( "path" ),
    lessMiddleWare = require( "less-middleware" ),
    i18n = require( "webmaker-i18n" );

habitat.load();

var app = express(),
    env = new habitat(),
    nunjucksEnv = new nunjucks.Environment( new nunjucks.FileSystemLoader( path.join( __dirname, 'views' )), {
      autoescape: true
    }),
    NODE_ENV = env.get( "NODE_ENV" ),
    WWW_ROOT = path.resolve( __dirname, "public" ),
    server;

nunjucksEnv.addFilter("instantiate", function(input) {
    var tmpl = new nunjucks.Template(input);
    return tmpl.render(this.getVariables());
});

if ( !( env.get( "MAKE_ENDPOINT" ) && env.get( "MAKE_PRIVATEKEY" ) && env.get( "MAKE_PUBLICKEY" ) ) ) {
  throw new Error( "MakeAPI Config setting invalid or missing!" );
}

// Initialize make client so it is available to other modules
require("./lib/makeapi")({
  apiURL: env.get( "MAKE_ENDPOINT" ),
  hawk: {
    key: env.get( "MAKE_PRIVATEKEY" ),
    id: env.get( "MAKE_PUBLICKEY" ),
    algorithm: "sha256"
  }
});

var routes = require("./routes");

nunjucksEnv.express( app );
app.disable( "x-powered-by" );

app.use( express.logger( NODE_ENV === "development" ? "dev" : "" ) );
if ( !!env.get( "FORCE_SSL" ) ) {
  app.use( helmet.hsts() );
  app.enable( "trust proxy" );
}

/**
 * Crash isolation and error handling, logging
 */
if ( env.get( "GRAYLOG_HOST" ) ) {
  require( 'graylog' );
  GLOBAL.graylogHost = env.get( "GRAYLOG_HOST" );
  GLOBAL.graylogFacility = "webmaker.org";
}
function reportError( error, isFatal ) {
  if ( !graylogHost ) {
    return;
  }
  log( "[" + ( isFatal ? "CRASH" : "ERROR" ) + "] webmaker.org failure.",
    error.message,
    {
      level: isFatal ? LOG_CRIT : LOG_ERR,
      stack: error.stack,
      _serverVersion: require( './package.json' ).version,
      _fullStack: error.stack
    }
  );
}
app.use( function( req, res, next ) {
  var guard = domain.create();
  guard.add( req );
  guard.add( res );

  guard.on( 'error', function( err ) {
    console.error( 'Error:', err.stack );
    try {
      // make sure we close down within 30 seconds
      var killtimer = setTimeout( function() {
        process.exit( 1 );
      }, 30000);
      // But don't keep the process open just for that!
      killtimer.unref();

      reportError( err, true );

      server.close();
      if ( cluster.worker ) {
        cluster.worker.disconnect();
      }

      res.statusCode = 500;
      res.render( 'error.html', { message: err.message, code: err.status });

      guard.dispose();
      process.exit( 1 );
    } catch( err2 ) {
      console.error( 'Error: unable to send 500', err2.stack );
    }
  });

  guard.run( next );
});


app.use( express.compress() );
app.use( express.static( WWW_ROOT ));
app.use( "/bower", express.static( path.join(__dirname, "bower_components" )));

// Setup locales with i18n
app.use( i18n.middleware({
  supported_languages: [
    'en-US'
  ],
  default_lang: "en-US",
  translation_directory: path.resolve( __dirname, "locale" )
}));

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
app.get( "/js/lib/nunjucks.js", function( req, res ) {
  res.sendfile( path.resolve( __dirname, "node_modules/nunjucks/browser/nunjucks-dev.js"));
});

app.use( app.router );
app.use( function( err, req, res, next) {
  if ( !err.status ) {
    err.status = 500;
  }
  reportError( err, false );
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

app.get( "/", routes.gallery({
  layout: "index",
  prefix: "p"
}));
app.get( "/editor", middleware.checkAdmin, routes.gallery({
  page: "editor"
}));
app.get( "/about", routes.page( "about" ) );
app.get( "/teach", routes.gallery({
  layout: "teach",
  prefix: "teach"
}));
app.get( "/starter-makes", routes.gallery({
  layout: "starterMakes",
  prefix: "template",
  limit: 20
}));
app.get( "/party", routes.page( "party" ) );
app.get( "/tools", routes.page( "tools" ) );
app.get( "/mentor", routes.page( "mentor" ) );
app.get( "/getinvolved", routes.page( "getinvolved" ) );
app.get( "/event-guides", routes.page( "event-guides" ) );
app.get( "/search", routes.search );
app.get( "/feedback", routes.page( "feedback" ) );
app.get( "/style-guide", routes.page( "style-guide" ) );

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

// Localized Strings
app.get( "/strings/:lang?", i18n.stringsRoute( "en-US" ) );

// BrowserID SSO realm file
app.get( "/.well-known/browserid-realm", routes.browserid( env.get( "SSO_DOMAINS" )));

/**
 * Legacy Webmaker Redirects
 */
require( "./routes/redirect" )( app );

server = app.listen( env.get( "PORT" ), function() {
  console.log( "Server listening ( http://localhost:%d )", env.get( "PORT" ));
});
