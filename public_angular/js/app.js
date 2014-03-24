'use strict';

angular.module('exploreApp', ['ngRoute', 'slugifier', 'ui.bootstrap', 'exploreApp.services', 'webmakerAngular.login', 'localization'])
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
  .run(['$rootScope', '$http', 'CONFIG', 'weblit',
    function($rootScope, $http, CONFIG, weblit) {
      $http.defaults.headers.common['X-CSRF-Token'] = CONFIG.csrf;
      $rootScope.$on('$locationChangeSuccess', function(event) {
        var ngView = document.querySelector('[ng-view]');
        if (ngView) {
          ngView.scrollTop = 0;
        }

        // Set locale information
        if (CONFIG.supported_languages.indexOf(CONFIG.lang) > 0) {
          $rootScope.lang = CONFIG.lang;
        } else {
          $rootScope.lang = CONFIG.defaultLang;
        }
        $rootScope.direction = CONFIG.direction;
        $rootScope.arrowDir = CONFIG.direction === 'rtl' ? "left" : "right";

        // Set up Web Literacy to rootScope
        var wlc = new weblit();
        $rootScope.literacies = wlc.all()

      });
    }
  ]);
