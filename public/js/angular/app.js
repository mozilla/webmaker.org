angular.module('webmakerApp', ['ngRoute', 'ui.bootstrap', 'webmakerApp.services', 'webmakerAngular.login', 'localization'])
  .config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {
      $routeProvider
        .when('/:locale?/explore', {
          templateUrl: 'views/explore.html',
          controller: 'exploreController'
        })
        .when('/:locale?/resources/home', {
          templateUrl: 'views/resources-home.html',
          controller: 'resourcesHomeController'
        })
        .when('/:locale?/resources/web-literacy/:id', {
          templateUrl: 'views/competency.html',
          controller: 'competencyController'
        })
        .otherwise({
          redirectTo: '/'
        });

      // html5mode
      $locationProvider.html5Mode(true);
      $locationProvider.hashPrefix('!');
    }
  ])
  .run(['$rootScope', '$http', '$routeParams', '$location', 'CONFIG', 'weblit',
    function ($rootScope, $http, $routeParams, $location, CONFIG, weblit) {

      // Configure CSRF token
      $http.defaults.headers.common['X-CSRF-Token'] = CONFIG.csrf;

      // Scroll
      $rootScope.$on('$locationChangeSuccess', function (event) {
        var ngView = document.querySelector('[ng-view]');
        if (ngView) {
          ngView.scrollTop = 0;
        }
      });

      // Set locale information
      if (CONFIG.supported_languages.indexOf(CONFIG.lang) > 0) {
        $rootScope.lang = CONFIG.lang;
      } else {
        $rootScope.lang = CONFIG.defaultLang;
      }
      $rootScope.direction = CONFIG.direction;
      $rootScope.arrowDir = CONFIG.direction === 'rtl' ? "left" : "right";

      // Set base url
      $rootScope.$on('$routeChangeSuccess', function (e, current, pre) {
        $rootScope.baseUrl = '/';
        if ($routeParams.locale) {
          $rootScope.baseUrl += $routeParams.locale + '/';
        }
      });

      // Set up content for competency pages
      $http
        .get('data/content.json')
        .success(function (data) {
          $rootScope.content = data;
        });
    }
  ]);
