define(['jquery', 'base/ui', 'base/gallery', 'base/login'],
  function ($, UI, Gallery, webmakerAuth) {
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
