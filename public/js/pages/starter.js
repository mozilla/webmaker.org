define(['jquery', 'base/gallery', 'base/login'],
  function ($, Gallery, webmakerAuth) {
    'use strict';

    new Gallery({
      makeView: 'make-starter-make.html',
      stickyPrefix: 'webmaker:template-',
      defaultSearch: {
        tags: ['webmaker:template']
      }
    });
  });
