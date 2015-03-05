define(['jquery'], function ($) {
  var AnchorSlide = function (target, options) {
    var self = this;

    var defaults = {
      speed: 400
    };

    for (var option in options) {
      defaults[option] = options[option] || defaults[option];
    }

    self.options = defaults;

    self.$trigger = $(target);

    self.$trigger.click(function (event) {
      event.preventDefault();
      self.slideTo($(this).attr('href'));
    });
  };

  AnchorSlide.prototype = {
    slideTo: function (id) {
      var self = this,
        targetYPosition = (id !== '#' ? $(id).offset().top : 0);

      $('body').animate({
        scrollTop: targetYPosition
      }, self.options.speed, function () {
        // Update URL hash when transition finishes
        window.location.hash = (id !== '#' ? id : '');
      });
    }
  };

  return AnchorSlide;
});
