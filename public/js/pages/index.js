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

      switch (val) {
      case 'featured':
        gallery.searchOptions.tags = {
          tags: ['webmaker:featured']
        };
        gallery.searchOptions.sortByField = ['createdAt', 'desc'];
        delete gallery.searchOptions.contentType;
        break;

      case 'popcorn':
        gallery.searchOptions.tags = {
          tags: ['webmaker:featured']
        };
        gallery.searchOptions.sortByField = ['createdAt', 'desc'];
        gallery.searchOptions.contentType = 'application/x-popcorn';
        break;

      case 'thimble':
        gallery.searchOptions.tags = {
          tags: ['webmaker:featured']
        };
        gallery.searchOptions.sortByField = ['createdAt', 'desc'];
        gallery.searchOptions.contentType = 'application/x-thimble';
        break;

      case 'appmaker':
        gallery.searchOptions.tags = {
          tags: ['webmaker:featured']
        };
        gallery.searchOptions.sortByField = ['createdAt', 'desc'];
        gallery.searchOptions.contentType = 'Appmaker';
        break;
      }

      // Reset and set to page 1
      gallery.searchOptions.page = 1;

      if (makes.length) {
        gallery.masonry.remove(makes);
      }

      gallery.search();

    });
  });
