define(['jquery'], function ($) {
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
    }

    function doSearch() {
      $searchTrigger.find('.icon-search')
        .removeClass('icon-search')
        .addClass('icon-spinner')
        .addClass('icon-spin');
      window.location = '/' + lang + '/search/?type=all&q=' + encodeURIComponent($searchInput.val());
    }

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
