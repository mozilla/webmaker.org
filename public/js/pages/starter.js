define(['jquery', 'base/ui', 'base/gallery'],
  function ($, UI, Gallery) {
    'use strict';

    var gallery = new Gallery({
      makeView: 'make-starter-make.html',
      stickyPrefix: 'webmaker:template-',
      defaultSearch: {
        tags: ['webmaker:template']
      }
    });

  });
