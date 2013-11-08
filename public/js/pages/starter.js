define(['jquery', 'base/ui', 'base/gallery'],
  function ($, UI, Gallery) {
    'use strict';

    new Gallery({
      makeView: 'make-starter-make.html',
      stickyPrefix: 'webmaker:template-',
      defaultSearch: {
        tags: ['webmaker:template']
      }
    });

  });
