define(['jquery', 'base/ui', 'base/gallery'],
  function ($, UI, Gallery) {
  'use strict';

  var gallery = new Gallery({
    banner: '#banner-teach',
    makeView: 'make-teach.html',
    stickyPrefix: 'webmaker:teach-',
    defaultSearch: 'guide'
  });

});
