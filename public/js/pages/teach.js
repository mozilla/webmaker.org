define(["jquery", "uri" ],
  function ($, URI) {
  "use strict";

  var stickyBanner = document.getElementById("banner-teach");
  var mainGallery = document.querySelector(".main-gallery");
  var packery = new Packery(mainGallery, {
    itemSelector: "div.make",
    gutter: ".gutter-sizer",
    transitionDuration: "0.2"
  });

  packery.stamp(stickyBanner);
  packery.layout();

});
