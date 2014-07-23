angular
  .module('webmakerApp.services', [])
  .constant('CONFIG', window.angularConfig)
  .filter('decodeURI', function () {
    return function (input) {
      return decodeURIComponent(input);
    };
  })
  .factory('wmNav', [
    '$rootScope',
    'CONFIG',
    function ($rootScope, config) {

      var activePage = '';
      var activeSection = '';

      return {
        nav: {
          sections: [
            {
              id: 'explore',
              url: 'explore',
              title: 'Explore',
              icon: 'random',
              pushState: true,
              pages: [
                {
                  id: 'index',
                  title: 'Gallery',
                  url: 'gallery'
                },
                {
                  id: 'super-mentor',
                  title: 'Super Mentor Badge',
                  url: 'badges/webmaker-super-mentor'
                },
                {
                  id: 'super-mentor',
                  title: 'Hive Community Badge',
                  url: 'badges/hive-community-member'
                },
                {
                  id: 'webmaker-mentor',
                  title: 'Webmaker Mentor Badge',
                  url: 'badges/webmaker-mentor'
                },
                {
                  id: 'badges-admin',
                  title: 'Badges Admin',
                  url: 'admin/badges',
                  pushState: true,
                  isAtleastMentor: true
                },
                {
                  id: 'search',
                  title: 'Search',
                  url: 'search'
                }
              ]
            },
            {
              id: 'tools',
              url: 'tools',
              title: 'Tools',
              icon: 'hand-o-up',
              pushState: true,
              pages: [
                {
                  id: 'popcorn',
                  icon: 'popcorn-icon',
                  title: 'Popcorn Maker',
                  url: 'https://popcorn.webmaker.org/' + config.lang,
                  external: 'true'
                },
                {
                  id: 'thimble',
                  icon: 'thimble-icon',
                  title: 'Thimble',
                  url: 'https://thimble.webmaker.org/' + config.lang,
                  external: 'true'
                },
                {
                  id: 'xray',
                  icon: 'xray-icon',
                  title: 'X-Ray Goggles',
                  url: 'https://goggles.webmaker.org/' + config.lang,
                  external: 'true'
                },
                {
                  id: 'appmaker',
                  icon: 'appmaker-icon',
                  title: 'Appmaker',
                  url: 'https://apps.webmaker.org/designer',
                  external: 'true'
                }
              ]
            },
            {
              id: 'resources',
              title: 'Resources',
              icon: 'book',
              pushState: true,
              dropdown: true
            },
            {
              id: 'events',
              url: 'events',
              title: 'Events',
              icon: 'map-marker'
            },
            {
              id: 'info',
              url: 'about',
              title: 'Info',
              icon: 'info'
            }
          ]
        },
        page: function (page) {
          if (page || page === '') {
            activePage = page;
            $rootScope.currentPageId = 'page-' + page;
          }
          return activePage;
        },
        section: function (section) {
          if (section || section === '') {
            activeSection = section;
            $rootScope.currentSectionId = section;
          }
          return activeSection;
        }
      };
    }
  ])
  .factory('weblit', [
    '$window',
    function ($window) {
      var weblit = new $window.WebLiteracyClient();
      return weblit;
    }
  ])
  .factory('wmAnalytics', [
    '$window',
    function ($window) {
      return $window.analytics;
    }
  ])
  .factory('makeapi', ['$q', '$window',
    function ($q, $window) {

      var makeapi = new $window.Make({
        apiURL: 'https://makeapi.webmaker.org'
      });

      return {
        makeapi: makeapi,
        tags: function (tags, callback) {
          var deferred = $q.defer();
          makeapi
            .sortByField('likes')
            .limit(4)
            .find({
              tags: [{
                tags: tags
              }],
              orderBy: 'likes'
            })
            .then(function (err, makes) {
              if (err) {
                deferred.reject(err);
              } else {
                deferred.resolve(makes);
              }
            });
          return deferred.promise;
        }
      };

    }
  ]);
