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
              url: 'gallery',
              title: 'Explore',
              icon: 'random',
              pages: [
                {
                  id: 'skill-sharer',
                  title: 'Skill Sharer Badge',
                  url: 'badges/skill-sharer'
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
              pushState: true
            },
            {
              id: 'events',
              url: 'events',
              title: 'Events',
              icon: 'map-marker'
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
      return new $window.WebLiteracyClient();
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
