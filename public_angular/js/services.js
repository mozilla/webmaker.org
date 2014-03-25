'use strict';

angular
  .module('exploreApp.services', [])
  .constant('CONFIG', window.angularConfig)
  .constant('SITE', {
    kits: {
      'navigation': [{
        title: 'What is a URL?',
        description: 'An introduction to the structure of URLs and finding resources on the well',
        author: '@secretrobotron',
        authorUrl: 'https://twitter.com/secretrobotron'
      }, {
        title: 'Finding and using links',
        description: 'Find links on a web page using Watson and learn how to evaluate them',
        author: '@secretrobotron',
        authorUrl: 'https://twitter.com/secretrobotron'
      }]
    },
    mentors: [
      {
        name: 'Brett Gaylor',
        avatar: '/img/explore/brett.jpg',
        title: 'Director of Webmaker, Filmmaker',
        handle: '@brett'
      },
      {
        name: 'Laura Hilliger',
        avatar: '/img/explore/laura.jpg',
        title: 'Curriculum Lead, Webmaker',
        handle: '@epilepticrabbit'
      },
      {
        name: 'Gavin Suntop',
        avatar: '/img/explore/gvn.jpg',
        gif: 'https://wmprofile-service-production.s3.amazonaws.com/gifs/ZAGFs14aDMiCRhICFSKqF7ft.gif',
        title: 'Code dude',
        handle: '@gvn'
      }
    ]
  })
  .filter('decodeURI', function() {
    return function(input) {
      return decodeURIComponent(input);
    };
  })
  .factory('weblit', [
    '$window',
    function($window) {
      var weblit = new $window.WebLiteracyClient();
      return weblit;
    }
  ])
  .factory('makeapi', ['$q',
    function($q) {

      var makeapi = new Make({
        apiURL: 'https://makeapi.webmaker.org'
      });

      return {
        makeapi: makeapi,
        tags: function(tags, callback) {
          var deferred = $q.defer();
          makeapi
            .sortByField('likes')
            .limit(4)
            .find({
              tags: [{tags: tags}],
              orderBy: 'likes'
            })
            .then(function(err, makes) {
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
