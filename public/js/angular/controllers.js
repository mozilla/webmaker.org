angular
  .module('webmakerApp')
  .controller('navigationController', ['$scope', '$location', '$routeParams', '$rootScope', 'weblit', 'wmNav',
    function ($scope, $location, $routeParams, $rootScope, weblit, wmNav) {

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
                "url": "gallery",
                external: true
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

      $scope.page = wmNav.page;
      $scope.section = wmNav.section;

      $scope.isActivePage = function (page) {
        return page === wmNav.page();
      };

      $scope.isActiveSection = function (section) {
        return section === wmNav.section();
      };

    }
  ])
  .controller('exploreController', ['$scope', 'CONFIG', 'wmNav',
    function ($scope, CONFIG, wmNav) {
      wmNav.page('explore');
      wmNav.section('explore');

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
  .controller('competencyController', ['$rootScope', '$scope', '$location', '$routeParams', 'weblit', 'CONFIG', '$timeout', 'wmNav',
    function ($rootScope, $scope, $location, $routeParams, weblit, CONFIG, $timeout, wmNav) {
      wmNav.page($routeParams.id);
      wmNav.section('resources');

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
  .controller('resourcesHomeController', ['$scope', 'weblit', 'wmNav',
    function ($scope, weblit, wmNav) {
      wmNav.page('resources');
      wmNav.section('resources');

      $scope.literacies = weblit.all();
    }
  ])
  .controller('badgesAdminController', ['$scope', '$http', 'wmNav',
    function ($scope, $http, wmNav) {
      wmNav.page('badges-admin');
      wmNav.section('explore');

      $scope.badges = [];

      $http
        .get('/api/badges')
        .success(function (badges) {
          $scope.badges = badges;
        });
    }
  ])
  .controller('badgesAdminBadgeController', ['$scope', '$http', '$routeParams', 'wmNav',
    function ($scope, $http, $routeParams, wmNav) {
      wmNav.page('badges-admin');
      wmNav.section('explore');

      var currentBadge = $routeParams.badge;

      $scope.badge = {};
      $scope.instances = [];
      $scope.badgesError = false;

      // Error handling

      function onError(err) {
        $scope.badgesError = err.error;
        console.log(err);
      }

      // This issues a new badge
      $scope.issueBadge = function (email) {
        $http
          .post('/api/badges/' + currentBadge + '/issue', {
            email: email
          })
          .success(function (data) {
            $scope.badgesError = false;
            $scope.instances.unshift(data);
          })
          .error(onError);
      };

      // This revokes badges
      $scope.revokeBadge = function (email) {
        $http
          .delete('/api/badges/' + currentBadge + '/instance/email/' + email)
          .success(function () {
            for (var i = 0; i < $scope.instances.length; i++) {
              if ($scope.instances[i].email === email) {
                $scope.instances.splice(i, 1);
              }
            }
          })
          .error(onError);
      };

      // On load, Get all instances
      $http
        .get('/api/badges/' + currentBadge + '/instances')
        .success(function (data) {
          $scope.instances = data.instances;
          $scope.badge = data.badge;
        })
        .error(onError);
    }
  ]);
