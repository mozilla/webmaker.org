/* global log, LOG_CRIT, LOG_ERR */

if (process.env.NEW_RELIC_HOME) {
  require('newrelic');
}

var express = require("express"),
  domain = require("domain"),
  cluster = require("cluster"),
  habitat = require("habitat"),
  helmet = require("helmet"),
  nunjucks = require("nunjucks"),
  path = require("path"),
  lessMiddleWare = require("less-middleware"),
  i18n = require("webmaker-i18n"),
  navigation = require("./navigation");

habitat.load();

var app = express(),
  env = new habitat(),
  nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(__dirname, 'views')), {
    autoescape: true
  }),
  NODE_ENV = env.get("NODE_ENV"),
  WWW_ROOT = path.resolve(__dirname, "public"),
  server;

nunjucksEnv.addFilter("instantiate", function (input) {
  var tmpl = new nunjucks.Template(input);
  return tmpl.render(this.getVariables());
});

// `localVar` filter accepting two parameters
// one is the input from 'gettext()' and another is the function itself
// the use case is {{ gettext("some input") | localVar(object) }}
// if the key name is "some input": "My name is {{name}}"
// tmpl.render(localVar) will try to render it with the available variable from the
// `localVar` object and return something like `My name is Ali`
nunjucksEnv.addFilter("localVar", function (input, localVar) {
  var tmpl = new nunjucks.Template(input);
  return tmpl.render(localVar);
});

// Make the client-side gettext possible!!
nunjucksEnv.addFilter("gettext", function (string) {
  return this.lookup('gettext')(string);
});

// For navigation
nunjucksEnv.addFilter("getSection", function (pageId) {
  var section;
  var page;
  for (var i in navigation) {
    section = navigation[i];
    for (var j in section.pages) {
      page = section.pages[j];
      if (page.id === pageId) {
        return section.id;
      }
    }
  }
  return "";
});

if (!(env.get("MAKE_ENDPOINT") && env.get("MAKE_PRIVATEKEY") && env.get("MAKE_PUBLICKEY"))) {
  throw new Error("MakeAPI Config setting invalid or missing!");
}

// Initialize make client so it is available to other modules
require("./lib/makeapi")({
  apiURL: env.get("MAKE_ENDPOINT"),
  hawk: {
    key: env.get("MAKE_PRIVATEKEY"),
    id: env.get("MAKE_PUBLICKEY"),
    algorithm: "sha256"
  }
});

var routes = require("./routes");

nunjucksEnv.express(app);
app.disable("x-powered-by");

app.use(express.logger(NODE_ENV === "development" ? "dev" : ""));
if ( !! env.get("FORCE_SSL")) {
  app.use(helmet.hsts());
  app.enable("trust proxy");
}

/**
 * Crash isolation and error handling, logging
 */
if (env.get("GRAYLOG_HOST")) {
  GLOBAL.graylogHost = env.get("GRAYLOG_HOST");
  GLOBAL.graylogFacility = env.get("GRAYLOG_FACILITY");
  require("graylog");
}

function reportError(error, isFatal) {
  try {
    var severity = isFatal ? "CRASH" : "ERROR";
    console.error(severity + ": " + error.stack);
    if (!GLOBAL.graylogHost) {
      return;
    }
    log("[" + severity + "] webmaker.org failure.",
      error.message, {
        level: isFatal ? LOG_CRIT : LOG_ERR,
        stack: error.stack,
        _fullStack: error.stack
      }
    );
  } catch (err) {
    console.error("Internal Error: unable to report error to graylog, err=" + err);
  }
}

app.use(function (req, res, next) {
  var guard = domain.create();
  guard.add(req);
  guard.add(res);

  // Safely run a function in error isolation

  function isolate(fn) {
    try {
      fn();
    } catch (e) {
      console.error('Internal error isolating shutdown sequence: ' + e);
    }
  }

  guard.on('error', function (err) {
    try {
      // Make sure we close down within 15 seconds
      var killtimer = setTimeout(function () {
        process.exit(1);
      }, 15000);
      // But don't keep the process open just for that!
      killtimer.unref();

      // Try and report this crash to graylog
      reportError(err, true);

      // Try and shutdown the server, cluster worker
      isolate(function () {
        server.close();
        if (cluster.worker) {
          cluster.worker.disconnect();
        }
      });

      // Try sending a pretty 500 to the user
      isolate(function () {
        if (res._headerSent || res.finished) {
          return;
        }

        res.statusCode = 500;
        res.render('error.html', {
          message: err.message,
          code: err.status
        });
      });

      guard.dispose();
    } catch (err2) {
      console.error('Internal error shutting down domain: ', err2.stack);
    }

    process.exit(1);
  });

  guard.run(next);
});

app.use(express.compress());
app.use(express.static(WWW_ROOT));
app.use("/bower", express.static(path.join(__dirname, "bower_components")));

// Setup locales with i18n
app.use(i18n.middleware({
  supported_languages: env.get("SUPPORTED_LANGS"),
  default_lang: "en-US",
  mappings: env.get("LANG_MAPPINGS"),
  translation_directory: path.resolve(__dirname, "locale")
}));

app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(express.cookieSession({
  key: "webmaker.sid",
  secret: env.get("SESSION_SECRET"),
  cookie: {
    maxAge: 2678400000, // 31 days. Persona saves session data for 1 month
    secure: !! env.get("FORCE_SSL")
  },
  proxy: true
}));
app.use(express.csrf());

app.locals({
  makeEndpoint: env.get("MAKE_ENDPOINT"),
  personaSSO: env.get("AUDIENCE"),
  loginAPI: env.get("LOGIN"),
  ga_account: env.get("GA_ACCOUNT"),
  ga_domain: env.get("GA_DOMAIN"),
  supportedLanguages: i18n.getLanguages(),
  listDropdownLang: env.get("SUPPORTED_LANGS"),
  PROFILE_URL: env.get("PROFILE_URL")
});

app.use(function (req, res, next) {
  res.locals({
    email: req.session.email || '',
    username: req.session.username || '',
    makerID: req.session.id || '',
    csrf: req.session._csrf,
    navigation: navigation,
    gettext: req.gettext
  });
  next();
});

require("./lib/events").init(app, nunjucksEnv, __dirname);

var optimize = NODE_ENV !== "development",
  tmpDir = path.join(require("os").tmpDir(), "mozilla.webmaker.org");
app.use(lessMiddleWare({
  once: optimize,
  debug: !optimize,
  dest: tmpDir,
  src: WWW_ROOT,
  compress: optimize,
  yuicompress: optimize,
  optimization: optimize ? 0 : 2
}));
app.use(express.static(tmpDir));

// Nunjucks
// This just uses nunjucks-dev for now -- middleware to handle compiling templates in progress
app.use("/views", express.static(path.join(__dirname, "views")));

app.use(app.router);
// We've run out of known routes, 404
app.use(function (req, res, next) {
  res.status(404);
  res.render('error.html', {
    code: 404
  });
});
// Final error-handling middleware
app.use(function (err, req, res, next) {
  err.status = err.status || 500;
  reportError(err);
  res.status(err.status);
  res.render('error.html', {
    message: err.message,
    code: err.status
  });
});

require("./lib/loginapi")(app, {
  loginURL: env.get("LOGINAPI"),
  audience: env.get("AUDIENCE"),
  verifierURI: env.get("PERSONA_VERIFIER_URI")
});

var middleware = require("./lib/middleware");

// ROUTES
var useNewHomePage = env.get("NEW_HOME_PAGE");
var teachTheWebRoute;

app.get("/healthcheck", routes.api.healthcheck);

if (useNewHomePage) {
  teachTheWebRoute = "/";
} else {
  teachTheWebRoute = "/teachtheweb";
  app.get("/", routes.gallery({
    layout: "index",
    prefix: "p"
  }));
}

app.get("/gallery", routes.gallery({
  layout: "index",
  prefix: "p"
}));

app.get(teachTheWebRoute, routes.gallery({
  layout: "teachtheweb",
  prefix: "frontpage",
  limit: 10
}));

app.get("/editor", middleware.checkAdmin, routes.gallery({
  page: "editor"
}));
app.get("/about", routes.page("about"));
app.get("/teach", routes.gallery({
  layout: "teach",
  prefix: "teach"
}));
app.get("/starter-makes", routes.gallery({
  layout: "starterMakes",
  prefix: "template",
  limit: 20
}));

app.get("/party", routes.page("party"));
app.get("/tools", routes.page("tools"));
app.get("/teach-templates", routes.page("teach-templates"));
app.get("/mentor", routes.page("mentor"));
app.get("/getinvolved", routes.page("getinvolved"));
app.get("/event-guides", routes.page("event-guides"));
app.get("/search", routes.search);
app.get("/feedback", routes.page("feedback"));
app.get("/standard", routes.page("standard"));
app.get("/standard/exploring", routes.page("standard-exploring"));
app.get("/standard/building", routes.page("standard-building"));
app.get("/standard/connecting", routes.page("standard-connecting"));
app.get("/style-guide", routes.page("style-guide"));

app.get("/details", routes.details);
// Old
app.get("/details/:id", function (req, res) {
  res.redirect("/details?id=" + req.params.id);
});

app.get("/me", routes.me);
// Old
app.get("/myprojects", routes.me);
app.post("/remove", routes.remove);
app.post("/like", routes.like.like);
app.post("/unlike", routes.like.unlike);

// Account
app.get("/login", routes.user.login);
app.get("/new", routes.user.newaccount);

app.get("/t/:tag", routes.tag);
app.get("/u/:user", routes.usersearch);

app.get("/terms", routes.page("terms"));
app.get("/privacy", routes.page("privacy"));

var personaHostname = env.get("PERSONA_HOSTNAME", "https://login.persona.org");

app.get("/sso/include.js", routes.includejs(env.get("HOSTNAME")));
app.get("/sso/include.html", routes.include({
  personaHostname: personaHostname
}));
app.get("/sso/include-transparent.html", routes.include({
  personaHostname: personaHostname,
  transparent: "transparent"
}));
app.get("/sitemap.xml", function (req, res) {
  res.type("xml");
  res.render("sitemap.xml");
});

// Localized Strings
app.get("/strings/:lang?", i18n.stringsRoute("en-US"));

// BrowserID SSO realm file
app.get("/.well-known/browserid-realm", routes.browserid(env.get("SSO_DOMAINS")));

/**
 * Legacy Webmaker Redirects
 */
require("./routes/redirect")(app);

server = app.listen(env.get("PORT"), function () {
  console.log("Server listening ( http://localhost:%d )", env.get("PORT"));
});
