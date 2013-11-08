define(['jquery', 'base/ui', 'base/gallery'],
  function ($, UI, Gallery) {
    'use strict';

    new Gallery({
      banner: '#banner-teach',
      makeView: 'make-teach.html',
      stickyPrefix: 'webmaker:teach-',
      defaultSearch: {
        tags: ['webmaker:teach']
      }
    });

  });
