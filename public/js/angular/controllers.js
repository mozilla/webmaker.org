angular
  .module('webmakerApp')
  .controller('navigationController', ['$scope', '$location', '$routeParams', '$rootScope', 'weblit',
    function ($scope, $location, $routeParams, $rootScope, weblit) {

      // Nav data
      $scope.nav = {
        sections: [
          {
            id: 'explore',
            url: 'explore',
            title: 'Explore',
            icon: 'random',
            pages: [
              {
                "id": "index",
                "title": "Gallery",
                "url": "gallery"
              },
              {
                id: 'super-mentor',
                title: 'Super Mentor Badge',
                url: 'badges/webmaker-super-mentor',
                external: true
              },
              {
                id: 'super-mentor',
                title: 'Hive Community Badge',
                url: 'badges/hive-community-member',
                external: true
              },
              {
                id: 'badges-admin',
                title: 'Badges Admin',
                url: 'admin/badges',
                external: true,
                adminOnly: true
              },
              {
                id: 'search',
                title: 'Search',
                url: 'search',
                external: true
              }
            ]
          },
          {
            id: 'tools',
            url: 'tools',
            title: 'Tools',
            icon: 'hand-o-up',
            external: true
          },
          {
            id: 'resources',
            url: 'resources',
            title: 'Resources',
            icon: 'book',
            pages: [
              {
                id: 'make-our-own',
                title: 'Make Your Own',
                url: 'make-your-own',
                external: true
              },
              {
                id: 'literacy',
                title: 'Web Literacy Map',
                url: 'literacy',
                external: true
              }
            ]
          },
          {
            id: 'events',
            url: 'events',
            title: 'Events',
            icon: 'map-marker',
            external: true
          },
          {
            id: 'info',
            url: 'about',
            title: 'Info',
            icon: 'info',
            external: true
          }
        ]
      };

      // Start with collapsed state for navigation
      $scope.isCollapsed = true;
      $scope.mobileTocCollapse = true;
      $scope.collapseAll = function () {
        $scope.isCollapsed = true;
        $scope.mobileTocCollapse = true;
      };

      $scope.clickedResource = false;
      $scope.literacies = weblit.all();

      $scope.isActive = function (tag) {
        return tag === $routeParams.id;
      };

      $scope.isActiveSection = function (section) {
        var path = $location.path() + '/';
        var match = path.match('/' + section + '/');
        return match && match.length;
      };

    }
  ])
  .controller('exploreController', ['$scope', 'CONFIG',
    function ($scope, CONFIG) {
      $scope.contributeBoxes = [{
        icon: 'book',
        title: 'Teaching kits',
        description: 'Teaching kits desc',
        target: '/' + CONFIG.lang + '/teach-templates'
      }, {
        icon: 'map-marker',
        title: 'Events',
        description: 'Events desc',
        target: 'https://events.webmaker.org/' + CONFIG.lang
      }, {
        icon: 'globe',
        title: 'Translate',
        description: 'Translate desc',
        target: 'https://support.mozilla.org/' + CONFIG.lang + '/kb/translate-webmaker'
      }, {
        icon: 'picture-o',
        title: 'Design',
        description: 'Design desc',
        target: 'https://wiki.mozilla.org/Webmaker/Design'
      }, {
        icon: 'code',
        title: 'Code',
        description: 'Code desc',
        target: 'https://support.mozilla.org/' + CONFIG.lang + '/kb/contribute-webmaker-code'
      }, {
        icon: 'rocket',
        title: 'Partner',
        description: 'Partner desc',
        target: 'http://party.webmaker.org/' + CONFIG.lang + '/partners'
      }];
    }
  ])
  .controller('competencyController', ['$rootScope', '$scope', '$location', '$routeParams', 'weblit', 'CONFIG', '$timeout',
    function ($rootScope, $scope, $location, $routeParams, weblit, CONFIG, $timeout) {

      $scope.tag = $routeParams.id;

      $scope.skill = weblit.all().filter(function (item) {
        return item.tag === $scope.tag;
      })[0];

      if ($rootScope.contentReady) {
        $scope.content = $rootScope.content[$scope.tag];
      } else {
        $timeout(function () {
          $scope.content = $rootScope.content[$scope.tag];
        }, 500);
      }
      $scope.weblit = weblit;

      $scope.wlcPoints = CONFIG.wlcPoints;

    }
  ])
  .controller('resourceFormController', ['$scope', '$http',
    function ($scope, $http) {
      $scope.formData = {};
      $scope.submit = function (form) {

        var data = $scope.formData;
        data.username = $scope._user.username;
        data.email = $scope._user.email;
        data.webliteracy = $scope.skill.term;

        $http
          .post('/api/submit-resource', data)
          .success(function (ok) {
            if (ok) {
              $scope.success = true;
              $scope.formData = {};
            }
          })
          .error(function (err) {
            console.log(err);
          });
      };
    }
  ])
  .controller('resourcesHomeController', ['$scope', 'weblit',
    function ($scope, weblit) {
      $scope.literacies = weblit.all();
    }
  ]);
