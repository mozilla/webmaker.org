'use strict';

angular
  .module('exploreApp')
  .controller('mainController', ['$scope', 'CONFIG',
    function ($scope, CONFIG) {
      $scope.contributeBoxes = [
        {
          icon: 'book',
          title: 'Teaching kits',
          description: 'Create or share a resource for teaching digital skills.',
          target: '/' + CONFIG.lang + '/teach-templates'
        },
        {
          icon: 'map-marker',
          title: 'Events',
          description: 'Host a Webmaker event in your hometown.',
          target: 'https://events.webmaker.org/' + CONFIG.lang
        },
        {
          icon: 'globe',
          title: 'Translate',
          description: 'Help localize and translate Webmaker.',
          target: 'https://support.mozilla.org/' + CONFIG.lang + '/kb/translate-webmaker'
        },
        {
          icon: 'picture-o',
          title: 'Design',
          description: 'Participate in co-design or level up on your design review skills',
          target: 'https://wiki.mozilla.org/Webmaker/Design'
        },
        {
          icon: 'code',
          title: 'Code',
          description: 'File bugs, submit patches or hack with our MakeAPI.',
          target: 'https://support.mozilla.org/' + CONFIG.lang + '/kb/contribute-webmaker-code'
        },
        {
          icon: 'rocket',
          title: 'Partner',
          description: 'Become a partner in our global Maker Party campaign, July to Sept 2014.',
          target: 'http://party.webmaker.org/' + CONFIG.lang + '/partners'
        }
      ];
    }
  ])
  .controller('navigationController', ['$scope', '$location', '$routeParams', 'weblit',
    function ($scope, $location, $routeParams, weblit) {
      $scope.isCollapsed = true;

      $scope.isActive = function (tag) {
        if (tag[0] === '/') {
          return tag === $location.path();
        }
        return tag === $routeParams.id;
      };

      $scope.isUnselected = function () {
        return window.location.hash === '#/';
      };
    }
  ])
  .controller('competencyController', ['$rootScope', '$scope', '$location', '$routeParams', 'weblit', 'makeapi', 'CONFIG',
    function ($rootScope, $scope, $location, $routeParams, weblit, makeapi, CONFIG) {

    $scope.tag = $routeParams.id;

    $scope.skill = weblit.all().filter(function (item) {
      return item.tag === $scope.tag;
    })[0];

    $scope.kits = $rootScope.kits[$scope.tag];

    $scope.skillMentors = $rootScope.mentors.filter(function (mentor) {
      return mentor.competencies.filter(function (competency) {
        return competency === $scope.tag;
      }).length
    });

    $scope.wlcPoints = CONFIG.wlcPoints;

    makeapi
      .tags($scope.skill.tag)
      .then(function(data) {
        $scope.makes = data;
      });

  }])
  .controller('addController', ['$scope', function ($scope) {
    //blah
  }]);
