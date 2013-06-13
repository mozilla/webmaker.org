define(['jquery'],
  function ($) {
  'use strict';

  var $body = $("body"),
      $makes = $(".make"),
      $deleteBtn = $(".delete-btn"),
      mainGallery = $(".main-gallery")[0],
      BASE_WIDTH = 240,
      GUTTER = 20,
      packery;

  // Are we inside thimble or popcorn?
  var inApp = $body.hasClass("popcorn") || $body.hasClass("thimble");

  // Do we have any makes?
  if (!$makes.length) {
    return;
  }

  // Set up scrollable container
  if (inApp) {
    $(".webmaker-outer-wrapper").css("width", ( ( BASE_WIDTH + GUTTER ) * $makes.length + GUTTER * 2 ) + "px");
    $("html").css("overflow-y", "hidden");
  }

  // Or, set up packery if we are on webmaker.org
  if (!inApp) {
    packery = new Packery( mainGallery, {
      itemSelector: 'div.make',
      gutter: '.gutter-sizer',
      transitionDuration: '0.2'
    });
  }

  // Set up the delete buttons
  $deleteBtn.on( "click", function(e) {
    e.preventDefault();
    var $this = $(this),
        makeID = $this.data("make-id");
    if(confirm("Are you sure you want to delete this make?")) {
      $.post("/remove", { makeID: makeID }, function(res) {
        if ( res.deletedAt ) {
          if (!inApp) {
            packery.remove($this.closest(".make")[0]);
            packery.layout();
          } else {
            $this.closest(".make").remove();
          }
        } else {
          console.log(res);
        }
      }).fail( function(res) {
        console.log(res.responseText);
      });
    }
  });
});
