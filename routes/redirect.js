module.exports = function (app) {

  var redirectMap = [{
    route: "/",
    paths: [
      "/projects",
      "/projects/:id",
      "/support",
      "/videos",
      "/hall-of-fame",
      "/ITU",
      "/ITU/*",
      "/new",
      "/login"
    ]
  }, {
    route: "/tools",
    paths: [
      "/tools/x-ray-goggles",
      "/tools/x-ray-goggles/install"
    ]
  }, {
    route: "/party",
    paths: [
      "/partners"
    ]
  }, {
    // Switch to SSL after Bug 883370 lands.
    route: "http://blog.webmaker.org",
    paths: [
      "/news"
    ]
  }, {
    route: "/teach",
    paths: [
      "/network",
      "/kits",
      "/kit-prototypes"
    ]
  }, {
    route: "/getinvolved",
    paths: [
      "/build",
      "/get-involved"
    ]
  }, {
    route: "/mentor",
    paths: [
      "/connect"
    ]
  }, {
    route: "/event-guides",
    paths: [
      "/guides"
    ]
  }, {
    route: "https://support.mozilla.org/kb/translate-webmaker",
    paths: [
      "/translate"
    ]
  }, {
    route: app.locals.EVENTS_URL,
    paths: [
      "/events",
      "/events/*"
    ]
  }];

  redirectMap.forEach(function (redirect) {
    redirect.paths.forEach(function (legacyRoute) {
      app.get(legacyRoute, function (req, res) {
        res.redirect(301, redirect.route);
      });
    });
  });
};
