angular
  .module('webmakerAngular.login', [])
  .factory('webmakerLoginService', ['$rootScope', '$window', 'CONFIG',
    function webmakerLoginService($rootScope, $window, CONFIG) {

      // This is needed to apply scope changes for events that happen in
      // async callbacks.
      function apply() {
        if (!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      }

      var auth = new $window.WebmakerAuthClient({
        host: '',
        csrfToken: CONFIG.csrf,
        handleNewUserUI: false
      });

      // Set up login/logout functions
      $rootScope.login = auth.login;
      $rootScope.logout = auth.logout;

      // Set up user data
      $rootScope._user = {};

      auth.on('login', function (user) {
        $rootScope._user = user;
        apply();

      });

      auth.on('logout', function (why) {
        $rootScope._user = {};
        apply();
      });

      auth.on('error', function (message, xhr) {
        console.log('error', message, xhr);
      });

      return auth;
    }
  ])
  .controller('createUserController', ['$scope', '$http', '$modal', 'webmakerLoginService',
    function ($scope, $http, $modal, webmakerLoginService) {

      webmakerLoginService.on('newuser', function (assertion) {
        $modal.open({
          templateUrl: 'views/create-user-form.html',
          controller: createUserCtrl,
          resolve: {
            assertion: function () {
              return assertion;
            }
          }
        });
      });

      var createUserCtrl = function ($scope, $modalInstance, webmakerLoginService, assertion) {

        $scope.form = {};
        $scope.user = {};

        $scope.checkUsername = function () {
          if (!$scope.form.user.username) {
            return;
          }
          $http
            .post(webmakerLoginService.urls.checkUsername, {
              username: $scope.form.user.username.$viewValue
            })
            .success(function (username) {
              $scope.form.user.username.$setValidity('taken', !username.exists);
            })
            .error(function (err) {
              console.log(err);
              $scope.form.user.username.$setValidity('taken', true);
            });
        };

        $scope.createUser = function () {
          $scope.submit = true;
          if ($scope.form.user.$valid && $scope.form.agree) {
            webmakerLoginService.createUser({
              assertion: assertion,
              user: $scope.user
            });
            $modalInstance.close();
          }
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      };

      webmakerLoginService.verify();
    }
  ]);
