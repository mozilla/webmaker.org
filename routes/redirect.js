module.exports = function (app) {
  var redirectMap = [{
    route: '/',
    paths: [
      '/projects',
      '/projects/:id',
      '/support',
      '/videos',
      '/hall-of-fame',
      '/ITU',
      '/ITU/*',
      '/new',
      '/login'
    ]
  }, {
    route: '/tools',
    paths: [
      '/tools/x-ray-goggles',
      '/tools/x-ray-goggles/install'
    ]
  }, {
    route: '/party',
    paths: [
      '/partners'
    ]
  }, {
    // Switch to SSL after Bug 883370 lands.
    route: 'http://blog.webmaker.org',
    paths: [
      '/news'
    ]
  }, {
    route: '/resources',
    paths: [
      '/network',
      '/kits',
      '/kit-prototypes',
      '/starter-makes'
    ]
  }, {
    route: '/getinvolved',
    paths: [
      '/build',
      '/get-involved'
    ]
  }, {
    route: '/mentor',
    paths: [
      '/connect'
    ]
  }, {
    route: app.locals.EVENTS_URL + '/#!/event-guides',
    paths: [
      '/guides',
      '/event-guides'
    ]
  }, {
    route: 'https://support.mozilla.org/kb/translate-webmaker',
    paths: [
      '/translate'
    ]
  }, {
    route: app.locals.EVENTS_URL,
    paths: [
      '/events'
    ]
  }, {
    route: app.locals.EVENTS_URL + '/#!/events/:event',
    paths: [
      '/events/:event'
    ]
  }, {
    route: '/mentor',
    paths: [
      '/community'
    ]
  }, {
    route: '/explore',
    paths: [
      '/gallery'
    ]
  }, {
    route: app.locals.TEACH_URL,
    paths: [
      '/_teach'
    ]
  }, {
    route: 'https://blog.webmaker.org/badges',
    paths: [
      '/_badges'
    ]
  }, {
    route: 'http://hivelearningnetworks.org/',
    paths: [
      '/_hive'
    ]
  }, {
  route: 'https://teach.mozilla.org/events',
    paths: [
      '/party',
      '/makerparty'
    ]
  }, {
    route: 'https://teach.mozilla.org/teach-like-mozilla/web-literacy',
    paths: [
      '/resources/*',
      '/literacy/*'
    ]
  },{
    route: 'https://teach.mozilla.org',
    paths: [
      '/mentor'
    ]
  }];

  redirectMap.forEach(function (redirect) {
    redirect.paths.forEach(function (legacyRoute) {
      app.get(legacyRoute, function (req, res) {
        var newURL = redirect.route;

        for (var param in req.params) {
          newURL = newURL.replace(':' + param, req.params[param]);
        }

        res.redirect(301, newURL);
      });
    });
  });
};
