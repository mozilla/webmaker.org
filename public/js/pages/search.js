define(['jquery', 'uri', 'base/ui', 'masonry', 'base/login', 'analytics', 'localized', 'jquery-ui.autocomplete'],
  function ($, URI, UI, Masonry, webmakerAuth, analytics, localized) {
    var query = $('.search-poster').attr('data-query'),
      queryKeys = URI.parse(window.location.href).queryKey,
      $searchPoster = $('.search-poster'),
      $searchButton = $('.search-btn'),
      $searchField = $('#search-field'),
      $searchFilter = $('#search-type'),
      $forkBtns = $('.make-fork-btn'),
      $userNameLinks = $('.user-link'),
      mainGallery = $('.main-gallery')[0],
      tagSuggestionEnabled = false,
      searchType = 'all',
      totalHits,
      LIMIT,
      masonry,
      page;

    function onKeyDown() {
      $('html, body').animate({
        scrollTop: 0
      }, 200);
      $searchPoster.addClass('focus');
      $searchField.off('keydown', onKeyDown);
    }

    $searchField.click(function () {
      $searchField.select();
    });

    $searchButton.click(function () {
      var searchInputVal = encodeURIComponent($searchField.val());
      analytics.event('Search ' + searchType + ' Clicked', {
        label: searchInputVal
      });
    });

    // Show the big green UI
    if ($searchPoster.hasClass('focus') && query) {
      $searchField.val(query.replace(/,/g, ', '));
      onKeyDown();
    } else {
      $searchField.on('keydown', onKeyDown);
    }

    $searchField.autocomplete({
      source: function (request, response) {
        var term = request.term;
        if (term === '#') {
          return response();
        }
        term = term.replace(/(^#)/, '');
        var searchUrl = '/api/20130724/make/tags?t=' + term;
        $.getJSON($('meta[name=\'make-endpoint\']').attr('content') + searchUrl, function (data) {
          response(data.tags.map(function (item) {
            return item.term;
          }));
        });
      },
      minLength: 1,
      delay: 200,
      select: function (e, ui) {
        $searchField.val(ui.item.value);
        $('.search-wrapper').submit();
      }
    });

    function likeClickCallback(e) {
      e.preventDefault();
      e.stopPropagation();
      var $this = $(this),
        makeID = $this.data('make-id'),
        method;

      if ($this.hasClass('fa-heart')) {
        method = '/unlike';
      } else {
        method = '/like';
      }
      $.post(method, {
        makeID: makeID,
        _csrf: $('meta[name=\'csrf-token\']').attr('content')
      }, function (res) {
        var newLen = res.likes.length,
          $count = $this.parent().parent().find('.like-count'),
          $text = $this.parent().parent().find('.like-text');

        $this.toggleClass('fa-heart fa-heart-o');
        $count.html(newLen);
        if (newLen === 0) {
          $text.html(localized.get('Like-0'));
        } else if (newLen === 1) {
          $text.html(localized.get('Like-1'));
        } else {
          $text.html(localized.get('Like-n'));
        }
      }).fail(function (res) {
        if (res.status === 401) {
          webmakerAuth.login();
        } else {
          // already like/unliked, update UI to reflect.
          $this.toggleClass('fa-heart fa-heart-o');
        }
      });
    }

    $('.make-like-toggle')
      .off('click')
      .on('click', likeClickCallback);

    function enableTagSuggestion() {
      $searchField.autocomplete('enable');
      tagSuggestionEnabled = true;
    }

    function disableTagSuggestion() {
      $searchField.autocomplete('disable');
      tagSuggestionEnabled = false;
    }

    if ($searchFilter.find('[name=type]').val() === 'tags') {
      enableTagSuggestion();
    } else {
      disableTagSuggestion();
    }

    // Setup masonry
    masonry = new Masonry(mainGallery, {
      itemSelector: 'div.make',
      gutter: '.gutter-sizer',
      transitionDuration: '0.2'
    });

    // Change what kind of search
    $searchFilter.find('li').click(function () {
      var $this = $(this);
      searchType = $this.attr('data-value');

      $searchFilter.find('[name=type]').val(searchType);
      $searchFilter.attr('class', 'search-filter icon-' + searchType);
      $searchFilter.find('.ui-on').removeClass('ui-on');
      $this.addClass('ui-on');
      if (!tagSuggestionEnabled && searchType === 'tags') {
        enableTagSuggestion();
      } else if (tagSuggestionEnabled) {
        disableTagSuggestion();
      }
    });

    $forkBtns.click(function (e) {
      e.stopPropagation();
    });

    $userNameLinks.click(function (e) {
      e.stopPropagation();
      queryKeys.page = 1;
      queryKeys.type = 'user';
      queryKeys.q = this.getAttribute('data-username');
      window.location.search = $.param(queryKeys);
    });

    page = queryKeys.page ? parseInt(queryKeys.page, 10) : 1;

    if (mainGallery) {
      totalHits = mainGallery.getAttribute('data-total-hits');
      LIMIT = mainGallery.getAttribute('data-limit');

      UI.pagination(page, totalHits, LIMIT, function (page) {
        queryKeys.page = page;

        if (queryKeys.q) {
          queryKeys.q = decodeURIComponent(queryKeys.q);
        }

        window.location.search = $.param(queryKeys);
      });
    }
  });
