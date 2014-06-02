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
          }
        }
      };
    }
  ])
  .directive('externalLink', function () {
    // Prevent default on all elements that have ngClick defined
    return {
      restrict: 'A',
      link: function (scope, el, attrs) {
        if (attrs.externalLink) {
          el.attr('target', '_blank');
        }
      }
    };
  })
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
  ]);
