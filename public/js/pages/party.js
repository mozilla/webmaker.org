define(["jquery"],
  function ($) {
  "use strict";
  var $carouselContainer = $(".commitment-carousel-items"),
      $carouselItems = $( ".commitment-carousel-item", $carouselContainer ),
      count = 0,
      max = $carouselItems.length;

  function rotateCarousel() {
    var next = count + 1;
    if ( count >= max ) {
      count = 0;
    }
    if ( next >= max) {
      next = 0;
    }
    var $item = $(".commitment-carousel-item:nth-child(" + count + ")", $carouselContainer ),
        $nextItem = $(".commitment-carousel-item:nth-child(" + next + ")", $carouselContainer );

    $item.fadeOut(function(){
      $nextItem.fadeIn();
    });
    count = count + 1;
  }

  setInterval( rotateCarousel, 5000 );
});
