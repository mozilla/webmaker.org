module.exports = function(req, res) {
  var sightmap = require("sightmap");

  sightmap([
    {
      loc: 'https://webmaker.org',
      changefreq: "daily",
      priority: 1.0
    },
    {
      loc: 'https://webmaker.org/about',
      changefreq: "weekly",
      priority: 1.0
    },
    {
      loc: 'https://webmaker.org/getinvolved',
      changefreq: "weekly",
      priority: 1.0
    },
    {
      loc: 'https://webmaker.org/guides',
      changefreq: "weekly",
      priority: 1.0
    },
    {
      loc: 'https://webmaker.org/mentor',
      changefreq: "weekly",
      priority: 1.0
    },
    {
      loc: 'https://webmaker.org/party',
      changefreq: "weekly",
      priority: 1.0
    },
    {
      loc: 'https://webmaker.org/privacy',
      changefreq: "monthly",
      priority: 1.0
    },
    {
      loc: 'https://webmaker.org/search',
      changefreq: "daily",
      priority: 1.0
    },
    {
      loc: 'https://webmaker.org/teach',
      changefreq: "daily",
      priority: 1.0
    },
    {
      loc: 'https://webmaker.org/terms',
      changefreq: "monthly",
      priority: 1.0
    },
    {
      loc: 'https://webmaker.org/tools',
      changefreq: "daily",
      priority: 1.0
    },
    {
      loc: 'https://thimble.webmaker.org/',
      changefreq: "daily",
      priority: 1.0
    },
    {
      loc: 'https://popcorn.webmaker.org/',
      changefreq: "daily",
      priority: 1.0
    }
  ]);
  sightmap(function(xml) {
    res.header('Content-Type', 'application/xml');
    res.send( xml );
  });
};
