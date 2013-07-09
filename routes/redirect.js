module.exports = function( app ) {

  var redirectMap = [
    {
      route: "/",
      paths: [
        "/en-US",
        "/projects",
        "/projects/:id",
        "/support",
        "/videos",
        "/hall-of-fame",
        "/ITU",
        "/ITU/*"
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
        "/build"
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
    }    
  ];

  redirectMap.forEach(function( redirect ) {
    redirect.paths.forEach(function( legacyRoute ) {
      app.get( legacyRoute, function( req, res ){
        res.redirect( 301, redirect.route );
      });
    });
  });
};
