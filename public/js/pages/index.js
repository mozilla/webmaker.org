require(['jquery', 'base/ui', 'base/gallery', 'base/login'],
  function ($, UI, Gallery, webmakerAuth) {
    'use strict';

    var gallery = new Gallery({
      banner: '#banner-join',
      makeView: 'make-teach.html',
      stickyPrefix: 'webmaker:p',
      defaultSearch: 'webmaker:recommended'
    });

    $('.btn-signin').click(webmakerAuth.login);

    webmakerAuth.on('login', function () {
      $('#banner-join').hide();
      gallery.masonry.layout();
    });

    webmakerAuth.on('logout', function () {
      $('#banner-join').show();
      gallery.masonry.layout();
    });

    UI.select('#search-filter', function (val) {
      var makes = document.querySelectorAll('.make');

      gallery.searchOptions.tags = {
        tags: ['webmaker:featured']
      };

      gallery.searchOptions.sortByField = [
        'createdAt',
        'desc'
      ];

      var contentTypes = {
        'popcorn': 'application/x-popcorn',
        'thimble': 'application/x-thimble',
        'appmaker': 'Appmaker'
      };

      var contentType = contentTypes[val];
      if (contentType) {
        gallery.searchOptions.contentType = contentType;
      } else if (val === 'featured') {
        delete gallery.searchOptions.contentType;
      }

      // Reset and set to page 1
      gallery.searchOptions.page = 1;

      if (makes.length) {
        gallery.masonry.remove(makes);
      }

      gallery.search();
    });
  });
