var hood = require('hood');

module.exports.checkAdmin = function (req, res, next) {
  if (!req.session.user || !req.session.user.isAdmin) {
    return next(new Error('Admin access only'));
  }
  return next();
};

module.exports.homePageRedirect = function (req, res, next) {
  if (req.session.user) {
    res.redirect(302, '/' + req.localeInfo.lang + '/explore');
  } else {
    next();
  }
};

module.exports.removeXFrameOptions = function (req, res, next) {
  res.removeHeader('x-frame-options');
  next();
};

module.exports.addCSP = function (options) {
  return hood.csp({
    headers: [
      'Content-Security-Policy-Report-Only'
    ],
    policy: {
      'connect-src': [
        '\'self\'',
        'http://*.log.optimizely.com',
        'https://*.log.optimizely.com',
        'https://makeapi.webmaker.org'
      ],
      'default-src': [
        '\'self\''
      ],
      'frame-src': [
        '\'self\'',
        'https://login.persona.org'
      ],
      'font-src': [
        '\'self\'',
        'http://mozorg.cdn.mozilla.net',
        'https://themes.googleusercontent.com',
        'https://netdna.bootstrapcdn.com',
        'https://fonts.gstatic.com'
      ],
      'img-src': [
        '*'
      ],
      'media-src': [
        '*'
      ],
      'script-src': [
        '\'self\'',
        '\'unsafe-eval\'',
        '\'unsafe-inline\'',
        'http://*.newrelic.com',
        'https://*.newrelic.com',
        'https://login.persona.org',
        'http://mozorg.cdn.mozilla.net',
        'https://mozorg.cdn.mozilla.net',
        'https://cdn.optimizely.com',
        'https://ssl.google-analytics.com'
      ],
      'style-src': [
        '\'self\'',
        '\'unsafe-inline\'',
        'http://mozorg.cdn.mozilla.net',
        'https://fonts.googleapis.com',
        'https://mozorg.cdn.mozilla.net',
        'https://netdna.bootstrapcdn.com'
      ]
    }
  });
};
