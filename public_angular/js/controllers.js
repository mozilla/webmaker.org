'use strict';

angular
  .module('exploreApp')
  .controller('navigationController', function ($scope, $location, $routeParams, Slug, SITE) {
    $scope.isCollapsed = true;

    $scope.isActive = function (name) {
      if (name[0] === '/') {
        return name === $location.path();
      }
      return Slug.slugify(name) === $routeParams.id;
    };

    $scope.isUnselected = function () {
      return window.location.hash === '#/';
    };
  })
  .controller('mainController', function ($scope) {
    //
  })
  .controller('competencyController', function ($rootScope, $scope, $location, $routeParams, Slug, makeapi, SITE) {

    $scope.slug = $routeParams.id;

    $scope.skill = $rootScope.literacies.filter(function (item) {
      return Slug.slugify(item.term) === $scope.slug;
    })[0];

    $scope.kits = SITE.kits[$scope.slug];

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
