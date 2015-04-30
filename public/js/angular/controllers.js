angular
  .module('webmakerApp')
  .controller('navigationController', ['$scope', '$location', '$routeParams', '$rootScope', 'weblit', 'wmNav', 'CONFIG',
    function ($scope, $location, $routeParams, $rootScope, weblit, wmNav, config) {
      // Nav data
      $scope.nav = wmNav.nav;

      // User urls
      $scope.accountSettingsUrl = config.accountSettingsUrl;
      $scope.eventsUrl = config.eventsUrl;
      $scope.teachUrl = config.teachUrl;

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
  .controller('exploreController', ['$scope', 'CONFIG',
    function ($scope, CONFIG) {
      $scope.eventsUrl = CONFIG.eventsUrl;

      $scope.contributeBoxes = [{
        icon: 'book',
        title: 'Teaching kits',
        description: 'Teaching kits desc',
        target: '/' + CONFIG.lang + '/make-your-own'
      }, {
        icon: 'map-marker',
        title: 'Events',
        description: 'Events desc',
        target: 'https://events.webmaker.org/'
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
  .controller('homeController', ['$rootScope', '$scope', 'wmNav', '$routeParams', 'localize', 'CONFIG',
    function ($rootScope, $scope, wmNav, $routeParams, localize, CONFIG) {
      wmNav.page('home');
      wmNav.section('');
      $scope.userDel = $routeParams.userDel;

      if ($routeParams.auth === 'login') {
        $rootScope.wmTokenLogin();
      } else if ($routeParams.auth === 'new-account') {
        $rootScope.wmCreateUser();
      }

      function onboardingExperience() {
        $('#home-start-form').on('submit', function () {
          $rootScope.joinWebmaker($('.home-email-field').val(), '', $('#onboarding-checkbox').prop('checked'));
        });
        var input = $('.onboarding-input');
        var inputText = localize.getLocalizedString('sharing');
        var currentLength = 0;
        var publishedText = $('.onboarding-published-text');
        var timeout;

        function setFontSize() {
          publishedText.css('font-size', publishedText.height() + 'em');
        }
        $(window).resize(setFontSize);

        $('.onboarding-next-button').click(function () {
          var text = input.val();
          $('.onboarding-step-1').addClass('hidden');
          $('.onboarding-step-2').removeClass('hidden');
          $('.home-panel').addClass('home-blue');
          $('.home-panel').removeClass('home-green');
          if (text) {
            setFontSize();
            publishedText.text(text);
          }
        });

        function cancelAutoInput() {
          clearTimeout(timeout);
          $('.onboarding-tooltip-container').removeClass('fade-in');
        }

        function inputTextCharacter() {
          input.val(input.val() + inputText[currentLength++]);
          if (currentLength < inputText.length) {
            timeout = setTimeout(inputTextCharacter, 200);
          }
        }
        input.click(function () {
          input[0].setSelectionRange(0, input.val().length);
          cancelAutoInput();
        });
        input.on('input', cancelAutoInput);
        input.on('blur', function () {
          $('.onboarding-tooltip-container').addClass('fade-in');
        });
        input.focus();
        timeout = setTimeout(inputTextCharacter, 2000);
      }

      if ($routeParams.variant === '6') {
        if (localize.resourceFileLoaded) {
          onboardingExperience();
        } else {
          $rootScope.$on('localizeResourcesUpdated', onboardingExperience);
        }
      } else {
        $('#home-start-form').on('submit', function () {
          $rootScope.joinWebmaker($('.home-email-field').val());
        });
      }
    }
  ])
  .controller('competencyController', ['$rootScope', '$scope', '$routeParams',
    'weblit', 'CONFIG', '$timeout', 'wmNav',
    function ($rootScope, $scope, $routeParams, weblit, CONFIG, $timeout, wmNav) {
      wmNav.page($routeParams.id);
      wmNav.section('resources');

      $scope.tag = $routeParams.id;

      $scope.skill = weblit.all().filter(function (item) {
        return item.tag === $scope.tag;
      })[0];

      if ($rootScope.contentReady) {
        $scope.content = $rootScope.allContent[$scope.tag];
      } else {
        $timeout(function () {
          $scope.content = $rootScope.allContent[$scope.tag];
        }, 500);
      }
      $scope.weblit = weblit;

      $scope.wlcPoints = CONFIG.wlcPoints;
    }
  ])
  .controller('competencyMediaGenController', ['$scope', '$sce',
    function ($scope, $sce) {
      function safeUrl(media) {
        // jscs:disable maximumLineLength
        var youtubeQueryStringParams = 'enablejsapi=1&amp;wmode=transparent&amp;autohide=1&amp;autoplay=0&amp;rel=0&amp;fs=1&amp;hd=1&amp;rel=0&amp;showinfo=0&amp;start=&amp;theme=dark';
        // jscs:enable maximumLineLength
        var vimeoQueryStringParams = 'title=0&amp;byline=0&amp;portrait=0&amp;color=eb6933';
        var sources = {
          'youtube': 'https://www.youtube-nocookie.com/embed/' + media.content + '?' + youtubeQueryStringParams,
          'vimeo': 'https://player.vimeo.com/video/' + media.content + '?' + vimeoQueryStringParams,
          'ted': 'https://embed-ssl.ted.com/talks/' + media.content + '.html',
          'popcorn': media.content
        };
        var source = sources[media.type];
        if (source) {
          return $sce.trustAsResourceUrl(source);
        } else {
          return media.content;
        }
      }
      $scope.safeUrl = safeUrl;
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
      wmNav.section('teach');

      $scope.literacies = weblit.all();
    }
  ])
  .controller('literacyController', ['$scope', 'weblit', 'wmNav', 'CONFIG',
    function ($scope, weblit, wmNav, CONFIG) {
      wmNav.section('resources');
      wmNav.page('literacy');
      $scope.litMapTitle = weblit.title() + ' - ' + weblit.version;
      $scope.strands = weblit.strands();
      $scope.litMap = weblit.allByStrand();
      $scope.wlcPoints = CONFIG.wlcPoints;
    }
  ])
  .controller('toolsController', ['$scope', 'wmNav',
    function ($scope, wmNav) {
      wmNav.page('tools');
      wmNav.section('tools');
    }
  ])
  .controller('makeYourOwnController', ['$rootScope', '$scope', '$timeout', 'wmNav', 'CONFIG',
    function ($rootScope, $scope, $timeout, wmNav, CONFIG) {
      wmNav.section('resources');
      wmNav.page('make-your-own');

      function init() {
        $scope.userId = $rootScope._user.id;
        $scope.direction = CONFIG.direction;
      }

      // Don't fire controller until after $rootScope is ready
      if ($rootScope._user) {
        init();
      } else {
        $timeout(function () {
          init();
        }, 500);
      }
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
        $scope.userId = $rootScope._user.id;
      }

      // Don't fire controller until after $rootScope is ready
      if ($rootScope._user) {
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
      $scope.reverse = false;
      $scope.predicate = 'created';
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
  .controller('createUpdateBadgeController', [
    '$rootScope',
    '$scope',
    '$http',
    '$routeParams',
    '$location',
    'wmNav',
    'CONFIG',
    function ($rootScope, $scope, $http, $routeParams, $location, wmNav, config) {
      wmNav.page('create-badge');
      wmNav.section('explore');

      // Update or create?
      $scope.view = $routeParams.badge ? 'update' : 'create';
      $scope.title = $routeParams.badge ? 'Update Badge' : 'Create a New Badge';

      if ($scope.view === 'update') {
        $http
          .get('/api/badges/' + $routeParams.badge)
          .success(function (data) {
            data.tags = data.tags.map(function (obj) {
              return obj.value;
            }).join(', ');
            $scope.badge = data;
          })
          .error(function (err) {
            console.log(err);
          });
      } else {
        // This holds all the values for the new badge
        $scope.badge = {
          criteria: [{
            description: '# This is an example\n* point 1\n* point 2\n* point 3'
          }]
        };
      }

      $scope.hasError = function (formEl) {
        return {
          'has-error': ($scope.submitAttempt || formEl.$dirty) && formEl.$invalid
        };
      };

      $scope.criteriaPreview = function () {
        if (!$scope.badge || !$scope.badge.criteria) {
          return '';
        }
        var result = $scope.badge.criteria.map(function (item) {
          return item.description;
        }).join('\n\n');
        return result;
      };

      $scope.addCriterion = function () {
        $scope.badge.criteria.push({
          description: ''
        });
      };

      $scope.removeCriterion = function (index) {
        $scope.badge.criteria.splice(index, 1);
      };

      function prepareBadge(data) {
        var badge = angular.copy(data);

        // Badgekit api requires both, but we want them to be the same.
        badge.consumerDescription = data.earnerDescription;
        badge.criteriaUrl = 'https://webmaker.org/badges/' + badge.slug;
        badge.unique = 0;
        badge.type = 'Skill';

        // Tags
        if (badge.tags) {
          badge.tags = data.tags.split(/[\s,]+/).filter(function (item) {
            return item;
          });
        } else {
          delete badge.tags;
        }

        // Criteria
        badge.criteria = data.criteria.map(function (criterion) {
          criterion.required = 1;
          return criterion;
        });

        return badge;
      }

      $scope.submit = function (isValid, badge) {
        $scope.submitAttempt = true;
        if (!isValid) {
          return;
        }
        var url = '/api/badges/' + ($routeParams.badge ? $routeParams.badge + '/' + $scope.view : 'create');
        badge = prepareBadge(badge);
        console.log('Sending...', badge);
        $http
          .post(url, badge)
          .success(function (data) {
            console.log('Success!', data);
            window.location = '/' + config.lang + '/badges/' + data.slug;
          })
          .error(function (err) {
            console.log(err);
          });
      };
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
      $scope.issueBadges = function (emailString, comment) {
        var emails = emailString.split(/[,;\n ]+/);
        $http
          .post('/api/badges/' + currentBadge + '/issue', {
            emails: emails,
            comment: comment
          })
          .success(function (data) {
            $scope.badgesError = false;
            $scope.instances = data.concat($scope.instances);
            $scope.issueComment = '';
            $scope.issueEmails = '';
          })
          .error(onError);
      };

      // This revokes badges
      $scope.revokeBadge = function (email) {
        var ok = $window.confirm('Are you sure you want to delete ' + email + '\'s badge?');
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
      $scope.audiences = [{
        title: 'students',
        image: '/img/appmaker/appmaker-hero-blue.svg'
      }, {
        title: 'business',
        image: '/img/appmaker/appmaker-hero-red.svg'
      }, {
        title: 'friends',
        image: '/img/appmaker/appmaker-hero-yellow.svg'
      }];

      $scope.makes = [{
        title: 'Music App',
        image: '/img/appmaker/music-app.jpg',
        remixUrl: '//apps.webmaker.org/' + $scope.lang + '/designer?remix=http://magical-profit-510.webmak.es/app',
        installUrl: '//magical-profit-510.webmak.es/install',
        appUrl: '//magical-profit-510.webmak.es/app'
      }, {
        title: 'Chat App',
        image: '/img/appmaker/chat-app.jpg',
        remixUrl: '//apps.webmaker.org/' + $scope.lang + '/designer?remix=http://scattered-reading-531.webmak.es/app',
        installUrl: '//scattered-reading-531.webmak.es/install',
        appUrl: '//scattered-reading-531.webmak.es/app'
      }, {
        title: 'Fireworks App',
        image: '/img/appmaker/fireworks-app.jpg',
        remixUrl: '//apps.webmaker.org/' + $scope.lang + '/designer?remix=http://neat-rate-866.webmak.es/app',
        installUrl: '//neat-rate-866.webmak.es/install',
        appUrl: '//neat-rate-866.webmak.es/app'
      }];

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
  .controller('gogglesController', ['$scope', 'CONFIG', 'wmAnalytics',
    function ($scope, config, analytics) {
      $scope.gogglesUrl = config.gogglesUrl;
      // activate the x-ray goggles on this page
      $('.goggles-activate-button').click(function () {
        document.head.appendChild(
          $('<script>')
          .addClass('webxray')
          .attr('src', config.gogglesUrl + '/en-US/webxray.js')
          .attr('data-baseuri', config.gogglesUrl + '/en-US')[0]
        );
        analytics.event('Goggles activated');
      });

      // toggle additional help text
      $('.goggles-help-button').click(function () {
        analytics.event('Goggles help button clicked');
        this.remove();
        $('.goggles-help-toggled').toggleClass('hidden');
      });

      $('.goggles-install-link').click(function () {
        analytics.event('Goggles install link clicked');
      });

      // On goggles install page
      $('.goggles-bookmark-link').on('dragstart', function () {
        analytics.event('Goggles bookmark dragged');
      });
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
      wmNav.section('teach');
      wmNav.page('getinvolved');
    }
  ])
  .controller('mentorController', ['$scope', 'wmNav',
    function ($scope, wmNav) {
      wmNav.section('teach');
      wmNav.page('mentor');
    }
  ])
  .controller('localebannerController', ['$scope', 'CONFIG', '$http', '$location',
    function ($scope, config, $http, $location) {
      $http.get('/localeInfo').success(function (localeInfo) {
        $scope.listLang = [];
        $scope.langmap = config.langmap;
        localeInfo.otherLangPrefs.map(function (item) {
          if (config.supportLang.indexOf(item) !== -1 &&
            $scope.listLang.indexOf(item) !== 1 && $scope.listLang.length < 1 &&
            item.match(/^[a-z]{2}/) && config.lang.match(/^[a-z]{2}/) &&
            item.match(/^[a-z]{2}/)[0] !== config.lang.match(/^[a-z]{2}/)[0]) {
            $scope.listLang.push(item);
          }
        });

        var el = document.getElementById('locale-banner');
        if (!$scope.listLang.length) {
          $scope.bannerBool = true;
          el.remove();
        }

        $scope.removeBanner = function removeBanner() {
          localStorage.setItem('localeBanner', true);
          $scope.bannerBool = true;
          el.remove();
        };

        $scope.acceptRedirect = function acceptRedirect() {
          var href = $location.path();
          var lang = config.lang;
          var supportedLanguages = config.supportLang;

          // Remove banner and set cookie session.
          $scope.removeBanner();

          // matches any of these:
          // `en`, `en-us`, `en-US` or `ady`
          var matchesLang;
          var matches = href.match(/([a-z]{2,3})([-]([a-zA-Z]{2}))?/);
          if (matches) {
            if (matches[1] && matches[2]) {
              matchesLang = matches[1].toLowerCase() + matches[2].toUpperCase();
            } else {
              matchesLang = matches[1].toLowerCase();
            }
          }
          // if the selected language is match to the language in the header
          if ($scope.listLang[0] === lang) {
            return;
            // check if we have any matches and they are exist in the array we have
          } else if ((matches && matches[0]) && supportedLanguages.indexOf(matchesLang) !== -1) {
            href = href.replace(matches[0], $scope.listLang[0]);
            window.location = href;
          } else if (href === '/') {
            window.location = '/' + $scope.listLang[0];
          } else {
            window.location = '/' + $scope.listLang[0] + href;
          }
        };

        $scope.didYouKnowLocale = localeInfo.didYouKnowLocale[$scope.listLang[0]];
        $scope.bannerBool = localStorage.getItem('localeBanner');
      });
    }
  ]);
