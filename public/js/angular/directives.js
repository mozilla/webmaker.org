angular
  .module('webmakerApp')
  .directive('wmAffix', ['$window', '$timeout',
    function ($window, $timeout) {
      return {
        restrict: 'EA',
        link: function (scope, el, attrs) {

          var elHeight = attrs.offsetHeight;
          var elTop = attrs.offsetTop;

          $window.addEventListener('scroll', function () {
            var scrollTop = $(this).scrollTop();
            if (scrollTop >= elTop) {
              $('body').css('padding-top', elHeight);
              el.addClass('navbar-affix-top');
              scope.affixed = true;
              scope.$apply();
            } else {
              $('body').css('padding-top', 0);
              el.removeClass('navbar-affix-top');
              scope.affixed = false;
              scope.$apply();
            }
          }, false);
        }
      };
    }
  ])
  .directive('a', [
    '$location',
    '$anchorScroll',
    function ($location, $anchorScroll) {
      return {
        restrict: 'E',
        link: function (scope, el, attrs) {
          // Make sure external links actually cause the browser to load a new page
          if (attrs.externalLink) {
            el.attr('target', '_self');
          }
          // Prevent default on all elements that have # as a location
          if (attrs.href === '#') {
            el.on('click', function (e) {
              e.preventDefault();
            });
          }
          // Make sure hash links send user to proper relative link
          else if (attrs.href && attrs.href.match(/(^|\s)#([^ ]*)/)) {
            el.on('click', function (e) {
              e.preventDefault();
              $location.hash(attrs.href.replace('#', ''));
              scope.$apply();
              $anchorScroll();
            });
          } else {
            window.scrollTo(0, 0);
          }
        }
      };
    }
  ])
  .directive('sampleMake', ['$window', 'makeapi',
    function ($window, makeapi) {
      return {
        restrict: 'A',
        templateUrl: '/views/partials/gallery-item.html',
        link: function (scope, el, attrs) {
          makeapi.makeapi
            .id(attrs.makeId)
            .then(function (err, makes) {
              if (err) {
                console.error(err);
              }
              scope.sampleMake = makes[0];
              scope.$apply();
            });
        }
      };
    }
  ])
  .directive('retinaImage', ['$window',
    function ($window) {
      'use strict';

      function renderImage($image, source) {
        $image.attr('src', source);
      }

      return {
        restrict: 'A',
        link: function (scope, el) {
          if ($window.devicePixelRatio !== undefined && $window.devicePixelRatio >= 1.5) {
            renderImage($(el), $(el).attr('data-src-2x'));
          } else {
            renderImage($(el), $(el).attr('data-src-1x'));
          }
        }
      };
    }
  ])
  .directive('marquee', ['$window',
    function ($window) {
      var $ = $window.jQuery;
      var Marquee = function (target, options) {
        var self = this,
          defaults,
          option;

        // Options ----------------------------------------------------------------

        defaults = {
          itemsPerGroup: 3,
          rotationSpeed: 5000, // Milliseconds
          fadeInSpeed: 1000
        };

        for (option in options) {
          defaults[option] = options[option] || defaults[option];
        }

        self.options = defaults;

        // Element references -----------------------------------------------------

        self.$container = $(target);
        self.$items = self.$container.children();

        // Properties -------------------------------------------------------------

        self.firstVisibleItemIndex = 0;
        self.itemCount = self.$items.length;
        self.visibleItems = [];
        self.rotationInterval = null; // Will become 'setInterval' reference
        self.isRotating = false;

        // Setup ------------------------------------------------------------------

        self.$items.fadeTo(0, 0).hide();
      };

      Marquee.prototype = {

        /**
         * Animate in a group of items
         * @param  {number} firstItemIndex
         * @return {undefined}
         */
        showGroup: function (firstItemIndex) {
          var self = this,
            group = [],
            i = 0;

          // Hide the currently visible group

          self.visibleItems.forEach(function (index) {
            self.$items.eq(index).hide();
          });

          // Build an array of indexes for next group to show

          while (i < self.options.itemsPerGroup) {
            // Loop around to start of array if necessary
            if (firstItemIndex >= self.itemCount) {
              firstItemIndex = firstItemIndex % self.itemCount;
            }

            group.push(firstItemIndex);

            firstItemIndex++;
            i++;
          }

          self.visibleItems = group;

          // Sort so that names animate in left to right

          group.sort(function (a, b) {
            return a > b;
          });

          // Fade in new group one-by-one

          group.forEach(function (itemIndex, i) {
            self.$items.eq(itemIndex).fadeTo(0, 0);

            setTimeout(function () {
              self.$items.eq(itemIndex).fadeTo(self.options.fadeInSpeed, 1);
            }, i * (self.options.fadeInSpeed / 4));
          });

        },

        /**
         * Start a periodic rotation of visible item groups
         * @return {undefined}
         */
        startRotation: function () {
          var self = this;

          self.isRotating = true;

          function showNextGroup() {
            if (self.visibleItems.length) {
              self.showGroup(self.visibleItems[self.visibleItems.length - 1] + 1);
            } else {
              self.showGroup(0);
            }
          }

          showNextGroup(); // Immediately show the first group

          self.rotationInterval = setInterval(showNextGroup, self.options.rotationSpeed);
        },

        /**
         * Stop rotating visible items
         * @return {undefined}
         */
        stopRotation: function () {
          var self = this;

          clearInterval(self.rotationInterval);
          self.isRotating = false;
        }
      };
      return {
        restrict: 'A',
        link: function (scope, el) {
          var marquee = new Marquee(el);
          marquee.startRotation();
        }
      };
    }
  ])
  .directive('wmArrowTo', function () {
    return {
      restrict: 'EA',
      template: '<img class="maker-party-arrow" src="/img/home/maker-party-arrow.svg">'
    };
  })
  .directive('languageSelect', ['CONFIG', '$timeout',
    function (config, $timeout) {
      return {
        restrict: 'A',
        link: function ($scope, $element) {
          var options = [];
          var lang;
          for (var i = 0; i < config.supported_languages.length; i++) {
            lang = config.supported_languages[i];
            options.push({
              id: lang,
              title: config.langmap[lang] ? config.langmap[lang].englishName + ' - ' + config.langmap[lang].nativeName : lang
            });
          }
          $timeout(function () {
            $element.selectize({
              options: options,
              labelField: 'title',
              valueField: 'id',
              searchField: ['title']
            });
            var selectize = $element[0].selectize;
            selectize.setValue('en-US');
          });
        }
      };
    }
  ]);
