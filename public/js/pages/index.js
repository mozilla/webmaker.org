require(['jquery', 'base/ui', 'base/gallery'],
  function($, UI, Gallery) {
    'use strict';

    var gallery = new Gallery({
      banner: '#banner-join',
      makeView: 'make-flip.html',
      stickyPrefix: 'webmaker:p',
      defaultSearch: 'webmaker:recommended'
    });

    // Hide the banner if the user already exists
    navigator.idSSO.app.onlogin = function(loggedInUser, displayName) {
      $('#banner-join').hide();
      gallery.packery.layout();
    };

    UI.select('#search-filter', function(val) {

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
      }

      // Reset and set to page 1
      gallery.searchOptions.page = 1;

      if (makes.length) {
        gallery.packery.remove(makes);
      }

      gallery.search();

    });

  });
