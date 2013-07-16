define(['jquery', 'base/ui', 'base/gallery'],
  function ($, UI, Gallery) {
  'use strict';

  var gallery = new Gallery({
    banner: '#banner-teach',
    makeView: 'make-teach.html',
    stickyPrefix: 'webmaker:teach-',
    defaultSearch: 'guide'
  });

  UI.select('#search-filter', function(val) {

    var makes = document.querySelectorAll('.make');

    switch (val) {
      case 'dummy':
        gallery.searchOptions.tags = {
          tags:[ 'webmaker:recommended', 'guide' ]
        };
        gallery.searchOptions.sortByField = ['createdAt', 'desc'];
        delete gallery.searchOptions.contentType;
        break;

      case 'featured':
        gallery.searchOptions.tags = {
          tags: ['webmaker:featured', 'guide']
        };
        gallery.searchOptions.sortByField = ['createdAt', 'desc'];
        delete gallery.searchOptions.contentType;
        break;

      case 'popcorn':
        gallery.searchOptions.tags = {
          tags: ['guide']
        };
        gallery.searchOptions.sortByField = ['createdAt', 'desc'];
        gallery.searchOptions.contentType = 'application/x-popcorn';
        break;

      case 'thimble':
        gallery.searchOptions.tags = {
          tags: ['guide']
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
