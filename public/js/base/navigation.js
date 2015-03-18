define(['jquery', 'analytics'], function ($, analytics) {
  return function navigation() {
    var $mainNavContainer = $('#main-navigation-container');
    var lang = $('html').attr('lang') || 'en-US';

    var $expandedNavTriggers = $('.navbar-toggle');
    var $navPrimary = $('#navigation-primary');
    var $navSecondary = $('#navigation-secondary');
    var $searchTrigger = $('#nav-search-trigger');
    var $searchInput = $('#nav-search-input');

    function toggleExpandedMenu(e) {
      e.preventDefault();

      analytics.event('Expand Menu', {
        label: $navPrimary.hasClass('collapse') ? 'Expand' : 'Collapse'
      });

      // expand
      if ($navPrimary.hasClass('collapse')) {
        $navSecondary.removeClass('collapse');
        $navPrimary.removeClass('collapse');
        $navSecondary.addClass('collapsing');
        $navPrimary.addClass('collapsing');
        setTimeout(function () {
          $navSecondary.removeClass('collapsing');
          $navPrimary.removeClass('collapsing');
        }, 350);
        // collapse
      } else {
        $navSecondary.addClass('collapsing');
        $navPrimary.addClass('collapsing');
        setTimeout(function () {
          $navSecondary.addClass('collapse');
          $navPrimary.addClass('collapse');
          $navSecondary.removeClass('collapsing');
          $navPrimary.removeClass('collapsing');
        });
      }
    }

    function doSearch() {
      var searchInputVal = encodeURIComponent($searchInput.val());
      analytics.event('Search all Clicked', {
        label: searchInputVal
      });
      $searchTrigger.find('.fa-search')
        .removeClass('fa-search')
        .addClass('fa-spinner')
        .addClass('fa-spin');
      window.location = '/' + lang + '/search/?type=all&q=' + searchInputVal;
    }

    $mainNavContainer.find('.navigation-list li a').on('click', function () {
      var name = this.textContent.trim();
      analytics.event('Menu Navigation Clicked', {
        label: name
      });
    });

    $expandedNavTriggers.on('click', toggleExpandedMenu);

    $searchTrigger.on('click', doSearch);
    $searchInput.on('keyup', function (e) {
      if (e.which === 13) {
        doSearch();
      }
    });
  };
});
