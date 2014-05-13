angular
  .module('exploreApp')
  .directive('mason', ['$window',
    function($window) {
      return {
        restrict: 'EA',
        priority: 0,
        link: function(scope, el) {

          var masonry = new $window.Masonry(el[0], {
            itemSelector: '.mason',
            columnWidth: '.mason',
            transitionDuration: '0.2s'
          });

          el.ready(function() {
            masonry.addItems([el]);
            masonry.reloadItems();
            masonry.layout();
          });

        }
      };
    }
  ])
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
