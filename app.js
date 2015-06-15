var newrelic;
if (process.env.NEW_RELIC_HOME) {
  newrelic = require('newrelic');
} else {
  newrelic = {
    getBrowserTimingHeader: function () {
      return '<!-- New Relic RUM disabled -->';
    }
  };
}

var express = require('express'),
  domain = require('domain'),
  cluster = require('cluster'),
  Habitat = require('habitat'),
  helmet = require('helmet'),
  http = require('http'),
  middleware = require('./lib/middleware'),
  nunjucks = require('nunjucks'),
  path = require('path'),
  lessMiddleWare = require('less-middleware'),
  i18n = require('webmaker-i18n'),
  WebmakerAuth = require('webmaker-auth'),
  navigation = require('./navigation'),
  rtltrForLess = require('rtltr-for-less'),
  markdown = require('markdown').markdown,
  proxy = require('proxy-middleware'),
  url = require('url');

Habitat.load();

var app = express(),
  env = new Habitat(),
  nunjucksEnv = nunjucks.configure([path.join(__dirname, '/views'), path.join(__dirname, '/bower_components')], {
    autoescape: true,
    watch: false
  }),
  NODE_ENV = env.get('NODE_ENV'),
  WWW_ROOT = path.resolve(__dirname, 'public'),
  server,
  messina,
  logger;

var flags = env.get('FLAGS') || {};

nunjucksEnv.addFilter('instantiate', function (input) {
  return nunjucks.renderString(input, this.getVariables());
});

// `localVar` filter accepting two parameters
// one is the input from 'gettext()' and another is the function itself
// the use case is {{ gettext('some input') | localVar(object) }}
// if the key name is 'some input': 'My name is {{name}}'
// tmpl.render(localVar) will try to render it with the available variable from the
// `localVar` object and return something like `My name is Ali`
nunjucksEnv.addFilter('localVar', function (input, localVar) {
  return nunjucks.renderString(input, localVar);
});

// Make the client-side gettext possible!!
nunjucksEnv.addFilter('gettext', function (string) {
  return this.lookup('gettext')(string);
});

// For navigation
nunjucksEnv.addFilter('getSection', function (pageId) {
  var id = '';
  navigation.forEach(function (section) {
    if (section.exclude && flags[section.exclude]) {
      return;
    } else if (section.flag && !flags[section.flag]) {
      return;
    }
    section.pages.forEach(function (page) {
      if (page.id === pageId) {
        id = section.id;
      }
    });
  });
  return id;
});

// Markdown
nunjucksEnv.addFilter('markdown', function (string) {
  return markdown.toHTML(string);
});

if (!(env.get('MAKE_ENDPOINT') && env.get('MAKE_PRIVATEKEY') && env.get('MAKE_PUBLICKEY'))) {
  throw new Error('MakeAPI Config setting invalid or missing!');
}

// Initialize make client so it is available to other modules
require('./lib/makeapi')({
  readOnlyURL: env.get('MAKE_ENDPOINT_READONLY') || env.get('MAKE_ENDPOINT'),
  authenticatedURL: env.get('MAKE_ENDPOINT'),
  hawk: {
    key: env.get('MAKE_PRIVATEKEY'),
    id: env.get('MAKE_PUBLICKEY'),
    algorithm: 'sha256'
  }
});

var webmakerAuth = new WebmakerAuth({
  loginURL: env.get('LOGIN'),
  authLoginURL: env.get('LOGINAPI'),
  loginHost: env.get('LOGIN_EMAIL_URL'),
  secretKey: env.get('SESSION_SECRET'),
  forceSSL: env.get('FORCE_SSL'),
  domain: env.get('COOKIE_DOMAIN')
});

var routes = require('./routes');

nunjucksEnv.express(app);
app.disable('x-powered-by');

if (env.get('ENABLE_GELF_LOGS')) {
  messina = require('messina');
  logger = messina('webmaker.org-' + env.get('NODE_ENV') || 'development');
  logger.init();
  app.use(logger.middleware());
} else {
  app.use(express.logger('dev'));
}

// Setup locales with i18n
app.use(i18n.middleware({
  supported_languages: env.get('SUPPORTED_LANGS'),
  default_lang: 'en-US',
  mappings: require('webmaker-locale-mapping'),
  translation_directory: path.resolve(__dirname, 'locale')
}));

// Proxy to profile-2
if (env.get('PROFILE_URL')) {
  app.use('/user', proxy(url.parse(env.get('PROFILE_URL'))));
}

app.use(require('prerender-node'));

app.use(helmet.iexss());
app.use(helmet.contentTypeOptions());
app.use(helmet.xframe('allow-from', 'http://optimizely.com'));

if ( !! env.get('FORCE_SSL')) {
  app.use(helmet.hsts());
  app.enable('trust proxy');
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

var optimize = NODE_ENV !== 'development';

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
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));

app.use(express.json());
app.use(express.urlencoded());

app.use(webmakerAuth.cookieParser());
app.use(webmakerAuth.cookieSession());

// Adding an external JSON file to our existing one for the specified locale
var webmakerLoginJSON = require('./bower_components/webmaker-login-ux/locale/en_US/webmaker-login.json');
var weblitLocaleJSON = require('./node_modules/web-literacy-client/dist/weblitmap.json');

i18n.addLocaleObject({
  'en-US': webmakerLoginJSON
}, function (err, res) {
  if (err) {
    console.error(err);
  }
});
i18n.addLocaleObject({
  'en-US': weblitLocaleJSON
}, function (err, res) {
  if (err) {
    console.error(err);
  }
});

app.use(express.csrf());

app.locals({
  makeEndpoint: env.get('MAKE_ENDPOINT_READONLY') || env.get('MAKE_ENDPOINT'),
  newrelic: newrelic,
  personaSSO: env.get('AUDIENCE'),
  loginAPI: env.get('LOGIN'),
  ga_account: env.get('GA_ACCOUNT'),
  ga_domain: env.get('GA_DOMAIN'),
  languages: i18n.getSupportLanguages(),
  EVENTS_URL: env.get('EVENTS_URL'),
  TEACH_URL: env.get('TEACH_URL'),
  flags: flags,
  personaHostname: env.get('PERSONA_HOSTNAME', 'https://login.persona.org'),
  bower_path: '../bower_components'
});

app.use(function (req, res, next) {
  var user = req.session.user;
  res.locals({
    wlcPoints: require('./lib/web-literacy-points.json'),
    currentPath: req.path,
    returnPath: req.param('page'),
    email: user ? user.email : '',
    username: user ? user.username : '',
    isAdmin: user ? user.isAdmin : false,
    isSuperMentor: user ? user.isSuperMentor : false,
    isMentor: user ? user.isMentor : false,
    makerID: user ? user.id : '',
    csrf: req.csrfToken(),
    navigation: navigation,
    gettext: req.gettext,
    campaignHeader: app.locals.flags.campaign ? '' + (Math.floor(Math.random() * +app.locals.flags.campaign)) : 0
  });
  next();
});

// Nunjucks
// This just uses nunjucks-dev for now -- middleware to handle compiling templates in progress
app.use('/templates', express.static(path.join(__dirname, 'views')));

// adding Content Security Policy (CSP) to webmaker.org
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
  if (typeof err === 'string') {
    console.error('You\'re passing a string into next(). Go fix this: %s', err);
  }

  var error = {
    message: err.toString(),
    code: http.STATUS_CODES[err.status] ? err.status : 500
  };

  console.error(err, err.stack);

  res.status(error.code);
  res.format({
    'text/html': function () {
      res.render('error.html', error);
    },
    'application/json': function () {
      res.send(err.message);
    }
  });
});

var middleware = require('./lib/middleware');

// ROUTES

app.post('/verify', webmakerAuth.handlers.verify);
app.post('/authenticate', webmakerAuth.handlers.authenticate);
app.post('/logout', webmakerAuth.handlers.logout);

app.post('/auth/v2/create', webmakerAuth.handlers.createUser);
app.post('/auth/v2/uid-exists', webmakerAuth.handlers.uidExists);
app.post('/auth/v2/request', webmakerAuth.handlers.request);
app.post('/auth/v2/authenticateToken', webmakerAuth.handlers.authenticateToken);
app.post('/auth/v2/verify-password', webmakerAuth.handlers.verifyPassword);
app.post('/auth/v2/request-reset-code', webmakerAuth.handlers.requestResetCode);
app.post('/auth/v2/reset-password', webmakerAuth.handlers.resetPassword);

// These webmaker-auth route handlers require a csrf token and a valid user session.
app.post('/auth/v2/remove-password', webmakerAuth.handlers.removePassword);
app.post('/auth/v2/enable-passwords', webmakerAuth.handlers.enablePasswords);

app.get('/healthcheck', routes.api.healthcheck);

app.get('/signup/:auth?', routes.angular);

// Angular
app.get('/tools', routes.angular);
app.get('/remix-your-school', routes.angular);
app.get('/music-video', routes.angular);
app.get('/private-eye', routes.angular);
app.get('/appmaker', routes.angular);
app.get('/feedback', routes.angular);
app.get('/getinvolved', routes.angular);
app.get('/about', routes.angular);

app.get('/make-your-own', routes.angular);
app.get('/madewithcode-*', routes.angular);
app.get('/home-:variant', middleware.homePageRedirect, routes.angular);

app.get('/explore', routes.gallery({
  layout: 'index',
  noPrefix: true
}));

app.get('/gallery/list/:list', routes.gallery_old({
  layout: 'index',
  prefix: 'p'
}));

app.get('/editor', middleware.checkAdmin, routes.gallery_old({
  page: 'editor'
}));

app.get('/privacy-makes', routes.gallery_old({
  layout: 'privacy-makes',
  prefix: 'privacy',
  limit: 20
}));

// Initialize badges routes
var badgesRoutes = routes.badges(env);

// Badge pages
app.get('/badges/:badge?', badgesRoutes.details);

// Badges admin
app.get('/admin/badges', badgesRoutes.middleware.atleast('isMentor'), routes.angular);
app.get('/admin/create-badge', badgesRoutes.middleware.atleast('isAdmin'), routes.angular);
app.get('/admin/badges/:badge', badgesRoutes.middleware.hasPermissions('viewInstances'), routes.angular);
app.get('/admin/badges/:badge/update', badgesRoutes.middleware.atleast('isAdmin'), routes.angular);

// Badges API
app.get('/api/badges', badgesRoutes.getAll);
app.post('/api/badges/create', badgesRoutes.create);
app.get('/api/badges/:badge', badgesRoutes.getBadge);
app.post('/api/badges/:badge/update', badgesRoutes.middleware.atleast('isAdmin'), badgesRoutes.update);
app.post('/api/badges/:badge/apply', badgesRoutes.apply);
app.post('/api/badges/:badge/claim', badgesRoutes.claim);
app.post('/api/badges/:badge/issue', badgesRoutes.middleware.hasPermissions('issue'), badgesRoutes.issue);
app.get('/api/badges/:badge/instances',
  badgesRoutes.middleware.hasPermissions('viewInstances'),
  badgesRoutes.getInstances);
app.get('/api/badges/:badge/applications',
  badgesRoutes.middleware.hasPermissions('applications'),
  badgesRoutes.getApplications);
app.post('/api/badges/:badge/applications/:application/review',
  badgesRoutes.middleware.hasPermissions('applications'),
  badgesRoutes.submitReview);
app.delete('/api/badges/:badge/instance/email/:email',
  badgesRoutes.middleware.hasPermissions('delete'),
  badgesRoutes.deleteInstance);

app.post('/api/submit-resource', routes.api.submitResource);

app.get('/search', routes.search);

// MOI splash page
app.get('/localweb', routes.page('localweb'));

// Old route - turned into a 301 (perm. redirect) on 2014-02-11.
// This route should not be removed until sufficient time
// has passed for search engines to index the new URL.
var literacyRedirect = function (req, res) {
  res.redirect(301, req.path.replace('standard', 'literacy'));
};
app.get('/standard', literacyRedirect);
app.get('/standard/*', literacyRedirect);

app.get('/style-guide', routes.page('style-guide'));

app.get('/details', middleware.removeXFrameOptions, routes.details);
// Old
app.get('/details/:id', middleware.removeXFrameOptions, function (req, res) {
  res.redirect('/details?id=' + req.params.id);
});

app.get('/me', routes.me);
// Old
app.get('/myprojects', routes.me);
app.post('/remove', routes.remove);
app.post('/like', routes.like.like);
app.post('/unlike', routes.like.unlike);

app.post('/report', routes.report.report);
app.post('/cancelReport', routes.report.cancelReport);

app.get('/t/:tag', routes.tag);
app.get('/u/:user', routes.usersearch);

app.get('/terms', routes.angular);
app.get('/privacy', routes.angular);
app.get('/languages', routes.page('languages'));

app.get('/app', routes.app);
app.post('/app/send-download-link', routes.api.sendSMS);

// goggles onboard, with special image routing for lowest-threshold onboarding
app.get('/goggles', routes.angular);
app.get('/goggles/install', routes.angular);
['Shapes', 'Shapes2', 'Blur', 'Blur2'].forEach(function (img) {
  img = img + '.jpg';
  app.get('/' + img, function (req, res) {
    res.redirect('/img/goggles/' + img);
  });
});

app.get('/sitemap.xml', function (req, res) {
  res.type('xml');
  res.render('sitemap.xml');
});

// Localized Strings
app.get('/strings/:lang?', i18n.stringsRoute('en-US'));

var accountSettingsUrl = env.get('LOGIN') + '/account';
var makeApiUrl = env.get('MAKE_ENDPOINT');
var eventsUrl = env.get('EVENTS_URL');
var teachUrl = env.get('TEACH_URL');
var gogglesUrl = env.get('XRAY_GOGGLES_URL');

app.get('/angular-config.js', function (req, res) {
  // Angular config
  var angularConfig = {
    accountSettingsUrl: accountSettingsUrl,
    makeApiUrl: makeApiUrl,
    eventsUrl: eventsUrl,
    teachUrl: teachUrl,
    lang: req.localeInfo.lang,
    localeInfo: req.localeInfo,
    direction: req.localeInfo.direction,
    defaultLang: 'en-US',
    supportLang: i18n.getLanguages(),
    supported_languages: i18n.getSupportLanguages(),
    langmap: i18n.getAllLocaleCodes(),
    csrf: req.csrfToken(),
    wlcPoints: res.locals.wlcPoints,
    gogglesUrl: gogglesUrl
  };

  res.setHeader('Content-type', 'text/javascript');
  res.send('window.angularConfig = ' + JSON.stringify(angularConfig));
});

app.get('/localeInfo', function (req, res) {
  req.localeInfo.didYouKnowLocale = {};
  req.localeInfo.otherLangPrefs.forEach(function (item, i) {
    req.localeInfo.didYouKnowLocale[item] = i18n.gettext('Did you know Webmaker is also available in', item);
  });
  res.setHeader('Content-type', 'text/javascript');
  res.send(JSON.stringify(req.localeInfo));
});

/**
 * Legacy Webmaker Redirects
 */
require('./routes/redirect')(app);

server = app.listen(env.get('PORT'), function () {
  console.log('Server listening ( http://localhost:%d )', env.get('PORT'));
});
