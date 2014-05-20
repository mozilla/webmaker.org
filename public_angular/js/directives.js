angular
  .module('exploreApp')
  .directive('wmAffix', ['$window', '$timeout',
    function ($window, $timeout) {
      return {
        restrict: 'EA',
        link: function (scope, el, attrs) {

          var elHeight = attrs.offsetHeight;
          var elTop = attrs.offsetTop;

          $window.addEventListener('scroll', function() {
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
  .directive('scrollTo', ['$anchorScroll', '$location',
    function($anchorScroll, $location) {
      return {
        restrict: 'A',
        link: function(scope, el, attrs) {
          var id = attrs.href.replace('#', '');
          if (!id) {
            return;
          }
          el.on('click', function (e) {
            e.preventDefault();
            $location.hash(id);
            $anchorScroll();
          });
        }
      }
    }
  ])
  .directive('scrollSidebar', ['$window',
    function($window) {
      return {
        restrict: 'EA',
        priority: 0,
        link: function(scope, el, attrs) {
          var windowEl = $($window);
          var offset = +attrs.offset;
          var elTop = el.offset().top + offset;

          windowEl.scroll(function() {
            var scrollTop = windowEl.scrollTop();
            if (scrollTop >= elTop) {
              el.css({
                position:'fixed',
                top: offset + 'px'
              });

            } else {
              el.css({
                position: '',
                top: ''
              });
            }
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
    }]);
