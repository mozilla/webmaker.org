var newrelic;
if (process.env.NEW_RELIC_HOME) {
  newrelic = require('newrelic');
} else {
  newrelic = {
    getBrowserTimingHeader: function () {
      return "<!-- New Relic RUM disabled -->";
    }
  };
}

var express = require("express"),
  domain = require("domain"),
  cluster = require("cluster"),
  habitat = require("habitat"),
  helmet = require("helmet"),
  http = require("http"),
  middleware = require("./lib/middleware"),
  nunjucks = require("nunjucks"),
  path = require("path"),
  lessMiddleWare = require("less-middleware"),
  i18n = require("webmaker-i18n"),
  WebmakerAuth = require("webmaker-auth"),
  navigation = require("./navigation"),
  rtltrForLess = require("rtltr-for-less"),
  markdown = require("markdown").markdown,
  proxy = require("proxy-middleware"),
  url = require("url");

habitat.load();

var app = express(),
  env = new habitat(),
  nunjucksEnv = new nunjucks.Environment([
    new nunjucks.FileSystemLoader(path.join(__dirname, 'views')),
    new nunjucks.FileSystemLoader(path.join(__dirname, 'bower_components'))
  ], {
    autoescape: true
  }),
  NODE_ENV = env.get("NODE_ENV"),
  WWW_ROOT = path.resolve(__dirname, "public"),
  server,
  messina,
  logger;

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

// Markdown
nunjucksEnv.addFilter("markdown", function (string) {
  return markdown.toHTML(string);
});

if (!(env.get("MAKE_ENDPOINT") && env.get("MAKE_PRIVATEKEY") && env.get("MAKE_PUBLICKEY"))) {
  throw new Error("MakeAPI Config setting invalid or missing!");
}

// Initialize make client so it is available to other modules
require("./lib/makeapi")({
  readOnlyURL: env.get("MAKE_ENDPOINT_READONLY") || env.get("MAKE_ENDPOINT"),
  authenticatedURL: env.get("MAKE_ENDPOINT"),
  hawk: {
    key: env.get("MAKE_PRIVATEKEY"),
    id: env.get("MAKE_PUBLICKEY"),
    algorithm: "sha256"
  }
});

var webmakerAuth = new WebmakerAuth({
  loginURL: env.get("LOGINAPI"),
  secretKey: env.get("SESSION_SECRET"),
  forceSSL: env.get("FORCE_SSL"),
  domain: env.get("COOKIE_DOMAIN")
});

var routes = require("./routes");

nunjucksEnv.express(app);
app.disable("x-powered-by");

if (env.get("ENABLE_GELF_LOGS")) {
  messina = require("messina");
  logger = messina("webmaker.org-" + env.get("NODE_ENV") || "development");
  logger.init();
  app.use(logger.middleware());
} else {
  app.use(express.logger("dev"));
}

// Proxy to profile-2
if (env.get('PROFILE_URL')) {
  app.use('/user', proxy(url.parse(env.get('PROFILE_URL'))));
}

app.use(helmet.iexss());
app.use(helmet.contentTypeOptions());
app.use(helmet.xframe());

if ( !! env.get("FORCE_SSL")) {
  app.use(helmet.hsts());
  app.enable("trust proxy");
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

      console.error(err);

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
      logger.error('Internal error shutting down domain: ', err2.stack);
    }

    process.exit(1);
  });

  guard.run(next);
});

var optimize = NODE_ENV !== "development";

app.use(lessMiddleWare(rtltrForLess({
  once: optimize,
  debug: !optimize,
  dest: '/css',
  src: '../less',
  root: WWW_ROOT,
  compress: optimize,
  yuicompress: optimize,
  optimization: optimize ? 0 : 2,
  sourceMap: !optimize
})));

app.use(express.compress());
app.use(express.static(WWW_ROOT));
app.use("/bower_components", express.static(path.join(__dirname, "bower_components")));

app.use(express.json());
app.use(express.urlencoded());

app.use(webmakerAuth.cookieParser());
app.use(webmakerAuth.cookieSession());

// Setup locales with i18n
app.use(i18n.middleware({
  supported_languages: env.get("SUPPORTED_LANGS"),
  default_lang: "en-US",
  mappings: require("webmaker-locale-mapping"),
  translation_directory: path.resolve(__dirname, "locale")
}));

// Adding an external JSON file to our existing one for the specified locale
var authLocaleJSON = require("./bower_components/webmaker-auth-client/locale/en_US/create-user-form.json");
var weblitLocaleJSON = require("./node_modules/web-literacy-client/dist/weblitmap.json");

i18n.addLocaleObject({
  "en-US": authLocaleJSON
}, function (err, res) {
  if (err) {
    console.error(err);
  }
});
i18n.addLocaleObject({
  "en-US": weblitLocaleJSON
}, function (err, res) {
  if (err) {
    console.error(err);
  }
});

app.use(express.csrf());

app.locals({
  makeEndpoint: env.get("MAKE_ENDPOINT"),
  newrelic: newrelic,
  personaSSO: env.get("AUDIENCE"),
  loginAPI: env.get("LOGIN"),
  ga_account: env.get("GA_ACCOUNT"),
  ga_domain: env.get("GA_DOMAIN"),
  languages: i18n.getSupportLanguages(),
  PROFILE_URL: env.get("PROFILE_URL"),
  EVENTS_URL: env.get("EVENTS_URL"),
  flags: env.get("FLAGS") || {},
  personaHostname: env.get("PERSONA_HOSTNAME", "https://login.persona.org"),
  bower_path: "bower_components"
});

app.use(function (req, res, next) {
  var user = req.session.user;
  res.locals({
    wlcPoints: require("./lib/web-literacy-points.json"),
    currentPath: req.path,
    returnPath: req.param('page'),
    email: user ? user.email : '',
    username: user ? user.username : '',
    isAdmin: user ? user.isAdmin : '',
    makerID: user ? user.id : '',
    csrf: req.csrfToken(),
    navigation: navigation,
    gettext: req.gettext,
    campaignHeader: app.locals.flags.campaign ? "" + (Math.floor(Math.random() * +app.locals.flags.campaign)) : 0
  });
  next();
});

// Angular
if (env.get('FLAGS_EXPLORE')) {
  app.use('/explore', express.static(path.join(__dirname, 'public_angular')));
}

// Nunjucks
// This just uses nunjucks-dev for now -- middleware to handle compiling templates in progress
app.use("/views", express.static(path.join(__dirname, "views")));

//adding Content Security Policy (CSP) to webmaker.org
app.use(middleware.addCSP());

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
  if (typeof err === "string") {
    console.error("You're passing a string into next(). Go fix this: %s", err);
  }

  var error = {
    message: err.toString(),
    code: http.STATUS_CODES[err.status] ? err.status : 500
  };

  console.error(err);

  res.status(error.code);
  res.render('error.html', error);
});

var middleware = require("./lib/middleware");

// ROUTES

app.post('/verify', webmakerAuth.handlers.verify);
app.post('/authenticate', webmakerAuth.handlers.authenticate);
app.post('/create', webmakerAuth.handlers.create);
app.post('/logout', webmakerAuth.handlers.logout);
app.post('/check-username', webmakerAuth.handlers.exists);

app.get("/healthcheck", routes.api.healthcheck);

app.get("/", routes.gallery({
  layout: "teachtheweb",
  prefix: "frontpage",
  limit: 10
}));

app.get("/gallery", routes.gallery({
  layout: "index",
  prefix: "p"
}));

app.get("/editor", middleware.checkAdmin, routes.gallery({
  page: "editor"
}));
app.get("/about", routes.page("about"));
app.get("/teach", routes.gallery({
  layout: "teach",
  prefix: "teach"
}));
app.get("/resources", routes.gallery({
  layout: "starterMakes",
  prefix: "template",
  limit: 20
}));
app.get("/privacy-makes", routes.gallery({
  layout: "privacy-makes",
  prefix: "privacy",
  limit: 20
}));

// Badges admin
app.get("/admin/badges", middleware.checkAdmin, routes.badges(env).admin);
app.get("/admin/badges/:badge", middleware.checkAdmin, routes.badges(env).adminBadge);
app.delete("/badges/:badge/instance/email/:email", middleware.checkAdmin, routes.badges(env).deleteInstance);

// Badges
app.get("/badges/:badge?", routes.badges(env).details);
app.post("/badges/:badge/apply", routes.badges(env).apply);
app.post("/badges/:badge/claim", routes.badges(env).claim);
app.post("/badges/:badge/issue", routes.badges(env).issue);

app.get("/tools", routes.page("tools"));
app.get("/teach-templates", routes.page("teach-templates"));
app.get("/mentor", routes.page("mentor"));
app.get("/getinvolved", routes.page("getinvolved"));
app.get("/search", routes.search);
app.get("/feedback", routes.page("feedback"));

// Old route - turned into a 301 (perm. redirect) on 2014-02-11.
// This route should not be removed until sufficient time
// has passed for search engines to index the new URL.
var literacyRedirect = function (req, res) {
  res.redirect(301, req.path.replace("standard", "literacy"));
};
app.get("/standard", literacyRedirect);
app.get("/standard/*", literacyRedirect);

app.get("/literacy", routes.literacy);

app.get("/literacy/exploring", routes.page("literacy-exploring"));
app.get("/literacy/building", routes.page("literacy-building"));
app.get("/literacy/connecting", routes.page("literacy-connecting"));
app.get("/style-guide", routes.page("style-guide"));

app.get("/details", middleware.removeXFrameOptions, routes.details);
// Old
app.get("/details/:id", middleware.removeXFrameOptions, function (req, res) {
  res.redirect("/details?id=" + req.params.id);
});

app.get("/me", routes.me);
// Old
app.get("/myprojects", routes.me);
app.post("/remove", routes.remove);
app.post("/like", routes.like.like);
app.post("/unlike", routes.like.unlike);

app.post("/report", routes.report.report);
app.post("/cancelReport", routes.report.cancelReport);

app.get("/t/:tag", routes.tag);
app.get("/u/:user", routes.usersearch);

app.get("/terms", routes.page("terms"));
app.get("/privacy", routes.page("privacy"));
app.get("/languages", routes.page("languages"));

app.get("/sitemap.xml", function (req, res) {
  res.type("xml");
  res.render("sitemap.xml");
});

// Localized Strings
app.get("/strings/:lang?", i18n.stringsRoute("en-US"));

// Angular config
var angularConfig = {
  accountSettingsUrl: env.get('LOGIN') + '/account',
};

app.get('/angular-config.js', function (req, res) {
  angularConfig.lang = req.localeInfo.lang;
  angularConfig.direction = req.localeInfo.direction;
  angularConfig.defaultLang = 'en-US';
  angularConfig.supported_languages = i18n.getSupportLanguages();
  angularConfig.csrf = req.csrfToken();
  angularConfig.wlcPoints = res.locals.wlcPoints;

  res.setHeader('Content-type', 'text/javascript');
  res.send('window.angularConfig = ' + JSON.stringify(angularConfig));
});

/**
 * Legacy Webmaker Redirects
 */
require("./routes/redirect")(app);

server = app.listen(env.get("PORT"), function () {
  console.log("Server listening ( http://localhost:%d )", env.get("PORT"));
});
