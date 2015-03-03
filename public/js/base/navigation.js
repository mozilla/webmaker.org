define(['jquery', 'analytics'], function ($, analytics) {
  return function navigation() {

    var $mainNavContainer = $('#main-navigation-container');
    var currentPage = $mainNavContainer.data('current-page');
    var currentSection = $mainNavContainer.data('current-section');
    var lang = $('html').attr('lang') || 'en-US';

    var $expandedNavTriggers = $('.navigation-more');
    var $expandedNav = $('#expanded-navigation');
    var $activeNavItems = $('[data-page="' + currentPage + '"], [data-section="' + currentSection + '"]');

    var $searchTrigger = $('#nav-search-trigger');
    var $searchInput = $('#nav-search-input');

    function toggleExpandedMenu(e) {
      e.preventDefault();
      $expandedNav.toggleClass('on');
      $activeNavItems.toggleClass('active');
      $expandedNavTriggers.toggleClass('active');
      analytics.event('Expand Menu', {
        label: $expandedNav.hasClass('on') ? "Expand" : "Collapse"
      });
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

    // Nav Accordion (For mobile)

    var $linkGroupHeaders = $expandedNav.find('.navigation-list li:first-child');
    var linkGroups = [];
    var $activeGroup;

    $expandedNav.find('.navigation-list').each(function () {
      $(this).addClass('collapsed');
      linkGroups.push($(this).find('li:not(:first-child)'));
    });

    $linkGroupHeaders.on('click', function () {
      if ($activeGroup) {
        $activeGroup.addClass('collapsed');
      }

      $(this).parent().toggleClass('collapsed');
      $activeGroup = $(this).parent();
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
