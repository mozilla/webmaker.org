'use strict';

angular
  .module('exploreApp')
  .controller('mainController', function ($scope) {
    // Home
  })
  .controller('navigationController', function ($scope, $location, $routeParams, weblit) {
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
  })
  .controller('competencyController', function ($rootScope, $scope, $location, $routeParams, weblit, makeapi, SITE) {

    $scope.tag = $routeParams.id;

    $scope.skill = weblit.all().filter(function (item) {
      return item.tag === $scope.tag;
    })[0];

    $scope.kits = $rootScope.kits[$scope.tag];

    $scope.mentors = SITE.mentors;

    makeapi
      .tags($scope.skill.tag)
      .then(function(data) {
        $scope.makes = data;
      });

  })
  .controller('addController', function ($scope) {
    //blah
  });
