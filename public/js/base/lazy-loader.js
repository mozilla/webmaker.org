define(['jquery'], function ($) {
  return {
    init: function ($images) {
      var self = this;

      self.unloadedImages = [];

      self.addImages($images);

      $(window).on('scroll', function (event) {
        self.loadVisibleImages();
      });

      return self;
    },
    calculateImageOffsets: function () {
      var self = this;

      self.unloadedImages.forEach(function (image, index) {
        self.unloadedImages[index].offset = self.unloadedImages[index].$image.offset().top;
      });

      return self;
    },
    addImages: function ($images) {
      var self = this;

      $images.each(function (index, el) {
        self.unloadedImages.push({
          $image: $(el),
          offset: $(el).offset().top
        });

        $(el).fadeTo(0, 0);
      });

      return self;
    },
    loadVisibleImages: function () {
      var self = this;

      var yScroll = window.scrollY;
      var windowHeight = window.innerHeight;

      self.unloadedImages.forEach(function (image, index) {
        if (image.offset < yScroll + windowHeight) {
          self.unloadedImages.splice(index, 1);

          image.$image.on('load', function () {
            image.$image.fadeTo(100, 1);
          });

          image.$image.attr('src', image.$image.data('src'));
        }
      });

      return self;
    }
  };
});
