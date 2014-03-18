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
  ]);
