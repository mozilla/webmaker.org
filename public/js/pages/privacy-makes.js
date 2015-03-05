define(['jquery', 'base/gallery'],
  function ($, Gallery) {
    'use strict';

    new Gallery({
      makeView: 'make-starter-make.html',
      stickyPrefix: 'webmaker:privacy-',
      defaultSearch: {
        tags: ['webmaker:privacy']
      }
    });
  });
