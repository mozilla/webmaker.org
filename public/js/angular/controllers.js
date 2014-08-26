angular
  .module('webmakerApp')
  .controller('navigationController', ['$scope', '$location', '$routeParams', '$rootScope', 'weblit', 'wmNav', 'CONFIG',
    function ($scope, $location, $routeParams, $rootScope, weblit, wmNav, config) {
      // Nav data
      $scope.nav = wmNav.nav;

      // User urls
      $scope.accountSettingsUrl = config.accountSettingsUrl;

      // Start with collapsed state for navigation
      $scope.primaryCollapse = true;
      $scope.secondaryCollapse = true;
      $scope.tertiaryCollapse = true;
      $scope.mobileCollapse = true;

      $scope.collapseToggle = function () {
        $scope.primaryCollapse = !$scope.primaryCollapse;
        $scope.secondaryCollapse = !$scope.secondaryCollapse;
        $scope.tertiaryCollapse = !$scope.tertiaryCollapse;
      };

      $scope.weblitToggle = function () {
        $scope.mobileCollapse = !$scope.mobileCollapse;
      };

      $rootScope.$on('$locationChangeSuccess', function (event) {
        $scope.primaryCollapse = true;
        $scope.secondaryCollapse = true;
        $scope.tertiaryCollapse = true;
        $scope.mobileCollapse = true;
      });

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

      // Search
      $scope.search = function (input) {
        window.location = '/' + config.lang + '/search?type=all&q=' + input;
      };

    }
  ])
  .controller('exploreController', ['$scope', 'CONFIG', 'wmNav',
    function ($scope, CONFIG, wmNav) {
      wmNav.page('explore');
      wmNav.section('explore');

      $scope.contributeBoxes = [
        {
          icon: 'book',
          title: 'Teaching kits',
          description: 'Teaching kits desc',
          target: '/' + CONFIG.lang + '/make-your-own'
        },
        {
          icon: 'map-marker',
          title: 'Events',
          description: 'Events desc',
          target: 'https://events.webmaker.org/' + CONFIG.lang
        },
        {
          icon: 'globe',
          title: 'Translate',
          description: 'Translate desc',
          target: 'https://support.mozilla.org/' + CONFIG.lang + '/kb/translate-webmaker'
        },
        {
          icon: 'picture-o',
          title: 'Design',
          description: 'Design desc',
          target: 'https://wiki.mozilla.org/Webmaker/Design'
        },
        {
          icon: 'code',
          title: 'Code',
          description: 'Code desc',
          target: 'https://support.mozilla.org/' + CONFIG.lang + '/kb/contribute-webmaker-code'
        },
        {
          icon: 'rocket',
          title: 'Partner',
          description: 'Partner desc',
          target: 'http://party.webmaker.org/' + CONFIG.lang + '/partners'
        }
      ];
    }
  ])
  .controller('homeController', ['$rootScope', '$scope', 'wmNav', '$routeParams',
    function ($rootScope, $scope, wmNav, $routeParams) {
      wmNav.page('home');
      wmNav.section('');
      $scope.userDel = $routeParams.userDel;

      if ($routeParams.auth === 'login') {
        $rootScope.login();
      } else if ($routeParams.auth === 'new-account') {
        // change this function when/if we move away from persona ?
        $rootScope.login();
      }
    }
  ])
  .controller('competencyController', ['$rootScope', '$scope', '$routeParams',
    'weblit', 'CONFIG', '$timeout', 'wmNav', '$sce',
    function ($rootScope, $scope, $routeParams, weblit, CONFIG, $timeout, wmNav,
      $sce) {
      wmNav.page($routeParams.id);
      wmNav.section('resources');

      $scope.tag = $routeParams.id;

      $scope.skill = weblit.all().filter(function (item) {
        return item.tag === $scope.tag;
      })[0];

      function prepContent(header) {
        $scope.content = $rootScope.content[$scope.tag];
        var contentSection, section, media;

        function swapLink(section, media, newUrl) {
          // Update trusted content item in JSON object
          contentSection[section].multimedia[media].content = $sce.trustAsResourceUrl(newUrl);
        }

        contentSection = $scope.content[header];

        // Loop through Discover, Make, and Teach
        for (section in contentSection) {
          if (contentSection.hasOwnProperty(section)) {
            // Loop through media items in section selected
            for (media in contentSection[section].multimedia) {
              if (contentSection[section].multimedia.hasOwnProperty(media)) {
                // Find content type, return modified content for template
                switch (contentSection[section].multimedia[media].type) {
                case 'youtube':
                  swapLink(section, media, 'https://www.youtube-nocookie.com/embed/' + contentSection[section].multimedia[media].content + '?enablejsapi=1&amp;wmode=transparent&amp;autohide=1&amp;autoplay=0&amp;rel=0&amp;fs=1&amp;hd=1&amp;rel=0&amp;showinfo=0&amp;start=&amp;theme=dark');
                  break;
                case 'vimeo':
                  swapLink(section, media, 'https://player.vimeo.com/video/' + contentSection[section].multimedia[media].content + '?title=0&amp;byline=0&amp;portrait=0&amp;color=eb6933');
                  break;
                case 'popcorn':
                  swapLink(section, media, contentSection[section].multimedia[media].content);
                  break;
                default:

                }
              }
            }
          }
        }
        return contentSection;
      }

      function updateContentObject() {
        $scope.content = $rootScope.content[$scope.tag];
        $scope.relatedIcon = $rootScope.content[$scope.content.related].icon;
        $scope.content.discover = prepContent('discover');
      }

      if ($rootScope.contentReady) {
        updateContentObject();
      } else {
        $timeout(function () {
          updateContentObject();
        }, 500);
      }
      $scope.weblit = weblit;

      $scope.wlcPoints = CONFIG.wlcPoints;

    }
  ])
  .controller('resourceFormController', ['$scope', '$http', 'wmAnalytics',
    function ($scope, $http, analytics) {
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
              analytics.event('Suggested Web Literacy Resource');
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
  .controller('toolsController', ['$scope', 'wmNav',
    function ($scope, wmNav) {
      wmNav.page('tools');
      wmNav.section('tools');
    }
  ])
  .controller('makeYourOwnController', ['$scope', 'wmNav', 'CONFIG',
    function ($scope, wmNav, CONFIG) {
      wmNav.page('make-your-own');
      wmNav.section('resources');
      $scope.direction = CONFIG.direction;
    }
  ])
  .controller('mwcController', ['$rootScope', '$scope', '$routeParams', '$timeout', 'wmNav',
    function ($rootScope, $scope, $routeParams, $timeout, wmNav) {
      wmNav.section('resources');
      wmNav.page('');

      $scope.page = $routeParams.mwc;

      // Keeps controller operations in one function to be fired when $rootScope is ready

      function init() {
        $scope.madewithcode = $rootScope.madewithcode[$scope.page];

      }

      // Don't fire controller until after $rootScope is ready
      if ($rootScope.mwcReady) {
        init();
      } else {
        $timeout(function () {
          init();
        }, 500);
      }
    }
  ])
  .controller('badgesAdminController', ['$rootScope', '$scope', '$http', 'wmNav',
    function ($rootScope, $scope, $http, wmNav) {
      wmNav.page('badges-admin');
      wmNav.section('explore');

      $scope.badges = [];
      $scope.hasPermissions = function (badge) {
        return window.badgesPermissionsModel({
          badge: badge,
          user: $rootScope._user,
          action: 'applications'
        });
      };

      $http
        .get('/api/badges')
        .success(function (badges) {
          $scope.badges = badges;
        });
    }
  ])
  .controller('badgesAdminBadgeController', ['$scope', '$http', '$window', '$routeParams', '$modal', 'wmNav',
    function ($scope, $http, $window, $routeParams, $modal, wmNav) {
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
            $scope.issueEmail = '';
          })
          .error(onError);
      };

      // This revokes badges
      $scope.revokeBadge = function (email) {
        var ok = $window.confirm('Are you sure you want to delete ' + email + "'s badge?");
        if (ok) {
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
        }
      };

      // This opens the review application dialog
      $scope.reviewApplication = function reviewApplication(application) {
        $modal.open({
          templateUrl: '/views/partials/review-application-modal.html',
          resolve: {
            application: function () {
              return application;
            }
          },
          controller: ReviewApplicationController
        }).result.then(function (review) {
          $http
            .post('/api/badges/' + currentBadge + '/applications/' + review.id + '/review', {
              comment: review.comment,
              reviewItems: createReviewItems(review.decision)
            })
            .success(function () {
              for (var i = 0; i < $scope.applications.length; i++) {
                if ($scope.applications[i].slug === review.id) {
                  $scope.applications.splice(i, 1);
                }
              }
            })
            .error(onError);
        });
      };

      // Allows all criteria to be satisfied/not satisfied based on single decision

      function createReviewItems(decision) {
        var criteria = $scope.badge.criteria;
        var reviewItems = [];
        // true not allowed due to bug 1021186
        var satisfied = decision === 'yes';

        criteria.forEach(function (item) {
          reviewItems.push({
            criterionId: item.id,
            satisfied: satisfied,
            comment: ''
          });
        });

        return reviewItems;
      }

      var ReviewApplicationController = function ($scope, $modalInstance, application) {
        $scope.review = {
          id: application.slug,
          email: application.learner
        };
        $scope.application = application;
        $scope.ok = function () {
          $modalInstance.close($scope.review);
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      };

      // On load, Get all instances
      $http
        .get('/api/badges/' + currentBadge + '/instances')
        .success(function (data) {
          $scope.instances = data.instances;
          $scope.badge = data.badge;
        })
        .error(onError);

      // Also get applications
      $http
        .get('/api/badges/' + currentBadge + '/applications')
        .success(function (data) {
          $scope.applications = data;
        })
        .error(onError);
    }
  ])
  .controller('appmakerController', ['$scope', '$rootScope', '$timeout',
    function ($scope, $rootScope, $timeout) {

      $scope.audiences = [
        {
          title: 'students',
          image: '/img/appmaker/appmaker-hero-blue.svg'
        },
        {
          title: 'business',
          image: '/img/appmaker/appmaker-hero-red.svg'
        },
        {
          title: 'friends',
          image: '/img/appmaker/appmaker-hero-yellow.svg'
        }
      ];

      $scope.makes = [
        {
          title: 'Music App',
          image: '/img/appmaker/music-app.jpg',
          remixUrl: '//apps.webmaker.org/' + $scope.lang + '/designer?remix=http://acidic-stick-959.webmak.es/app',
          installUrl: '//acidic-stick-959.webmak.es/install',
          appUrl: '//acidic-stick-959.webmak.es/app'
        },
        {
          title: 'Chat App',
          image: '/img/appmaker/chat-app.jpg',
          remixUrl: '//apps.webmaker.org/' + $scope.lang + '/designer?remix=http://cute-window-475.webmak.es/app',
          installUrl: '//cute-window-475.webmak.es/install',
          appUrl: '//cute-window-475.webmak.es/app'
        },
        {
          title: 'Fireworks App',
          image: '/img/appmaker/fireworks-app.jpg',
          remixUrl: '//apps.webmaker.org/' + $scope.lang + '/designer?remix=http://sweet-coil-961.webmak.es/app',
          installUrl: '//sweet-coil-961.webmak.es/install',
          appUrl: '//sweet-coil-961.webmak.es/app'
        }
      ];

      // Properties the view needs to see
      $scope.showAudienceTitle = $scope.audiences[0].title;
      $scope.currentSlideIndex = 0;

      // Group of timeout promises used to transition the selected audience
      var transitionPromises = [];

      // Reference to the slide that's actually coming up
      var currentSlideIndex = 0;

      $scope.setActiveSlide = function (active, index) {
        // If the slide that called this function is active...
        if (active) {
          // ... and it's not already the slide we're headed to...
          if (currentSlideIndex !== index) {
            currentSlideIndex = index;

            // Destroy any existing promises
            if (transitionPromises.length) {
              transitionPromises.forEach($timeout.cancel);
            }

            // Hide the audience text
            $scope.showAudienceTitle = false;

            // Wait until audience text is faded out; then change view's currentSlideIndex
            transitionPromises.push($timeout(function () {
              $scope.currentSlideIndex = currentSlideIndex;
            }, 400));

            // Show audience text again once fade has happened and text has changed
            transitionPromises.push($timeout(function () {
              $scope.showAudienceTitle = $scope.audiences[currentSlideIndex].title;
            }, 800));
          }
        }
      };
    }
  ])
  .controller('feedbackController', ['$scope', 'wmNav',
    function ($scope, wmNav) {
      wmNav.section('info');
      wmNav.page('feedback');
    }
  ])
  .controller('getinvolvedController', ['$scope', 'wmNav',
    function ($scope, wmNav) {
      wmNav.section('info');
      wmNav.page('getinvolved');
    }
  ]);
