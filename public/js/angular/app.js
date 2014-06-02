angular.module('webmakerApp', ['ngRoute', 'ui.bootstrap', 'webmakerApp.services', 'webmakerAngular.login', 'localization', 'ngScrollSpy'])
  .config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {
      $routeProvider
        .when('/:locale?/explore', {
          templateUrl: 'views/explore.html',
          controller: 'exploreController'
        })
        .when('/resources', {
          templateUrl: 'views/resources.html',
          controller: 'resourcesHomeController'
        })
        .when('/:locale/resources', {
          templateUrl: 'views/resources.html',
          controller: 'resourcesHomeController'
        })
        .when('/:locale?/resources/literacy/:id', {
          templateUrl: 'views/competency.html',
          controller: 'competencyController'
        })
        .otherwise({
          redirectTo: '/resources'
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

      // Set up content for competency
      $http
        .get('data/content.json')
        .success(function (data) {
          $rootScope.content = data;
          $rootScope.contentReady = true;
        });
    }
  ]);
