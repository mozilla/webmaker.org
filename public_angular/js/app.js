'use strict';

angular.module('exploreApp', ['ngRoute', 'slugifier', 'ui.bootstrap', 'exploreApp.services', 'webmakerAngular.login'])
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'mainController'
      })
      .when('/competencies/:id', {
        templateUrl: 'views/competency.html',
        controller: 'competencyController'
      })
      .when('/add', {
        templateUrl: 'views/add.html',
        controller: 'addController'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(['$rootScope', '$http', 'CONFIG',
    function($rootScope, $http, CONFIG) {
      $http.defaults.headers.common['X-CSRF-Token'] = CONFIG.csrf;
      $rootScope.$on('$locationChangeSuccess', function(event) {
        var ngView = document.querySelector('[ng-view]');
        if (ngView) {
          ngView.scrollTop = 0;
        }
      });
    }
  ]);
