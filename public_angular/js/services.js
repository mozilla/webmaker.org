'use strict';

angular
  .module('exploreApp.services', [])
  .constant('CONFIG', window.angularConfig)
  .constant('SITE', {
    skills: [{
      name: 'Navigation',
      tags: ['navigation'],
      colour: '#ff4e1f',
      description: 'Using software tools to browse the web'
    }, {
      name: 'Web Mechanics',
      tags: ['web-mechanics'],
      colour: '#ff6969',
      description: 'Understanding the web ecosystem'
    }, {
      name: 'Search',
      tags: ['search'],
      colour: '#fe4040',
      description: 'Locating information, people and resources via the web'
    }, {
      name: 'Credibility',
      tags: ['credibility'],
      colour: '#ff5984',
      description: 'Critically evaluating information found on the web'
    }, {
      name: 'Security',
      tags: ['security'],
      colour: '#ff004e',
      description: 'Keeping systems, identities, and content safe'
    }, {
      name: 'Composing for the web',
      tags: ['composing-for-the-web'],
      colour: '#01bc85',
      description: 'Creating and curating content for the web'
    }, {
      name: 'Remixing',
      tags: ['remixing'],
      colour: '#00ceb8',
      description: 'Modifying existing web resources to create something new'
    }, {
      name: 'Design and Accessibility',
      tags: ['design', 'accessibility'],
      colour: '#6ecba9',
      description: 'Creating universally effective communications through web resources'
    }, {
      name: 'Coding and scripting',
      tags: ['coding'],
      colour: '#00967f',
      description: 'Creating interactive experiences on the web'
    }, {
      name: 'Infrastructure',
      tags: ['infrastructure'],
      colour: '#09b773',
      description: 'Understanding the Internet stack'
    }, {
      name: 'Sharing and Collaborating',
      tags: ['sharing', 'collaborating'],
      colour: '#739ab1',
      description: 'Jointly creating and providing access to web resources'
    }, {
      name: 'Community Participation',
      tags: ['community'],
      colour: '#63cfea',
      description: 'Getting involved in web communities and understanding their practices'
    }, {
      name: 'Privacy',
      tags: ['privacy'],
      colour: '#00bad6',
      description: 'Examining the consequences of sharing data online'
    }, {
      name: 'Open Practices',
      tags: ['open-practices', 'open'],
      colour: '#0097d6',
      description: 'Helping to keep the web democratic and universally accessible'
    }],
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
