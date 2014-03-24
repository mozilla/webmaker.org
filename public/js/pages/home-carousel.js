define(['jquery'], function ($) {
  var Carousel = function (target) {
    var self = this;

    // ELEMENT REFERENCES ---------------------------------------------------

    self.$wrapper = $(target);
    self.$toggleButtonContainer = $('.mentor-story-nav', target);
    self.$toggleButtons = $('.mentor-story-nav a', target);
    self.$nextButton = $('.go-forward', target);
    self.$backButton = $('.go-back', target);
    self.$slides = $('.poster-image-container div', target);
    self.$spinner = $('.spinner', target);

    // PROPERTIES -----------------------------------------------------------

    self.totalStories = self.$slides.length;
    self.imageLoading = false;

    // SETUP ----------------------------------------------------------------

    var randomIndex = Math.floor(Math.random() * self.totalStories);

    self.changeStory(self.getStoryByNumber(randomIndex));

    // EVENT BINDING --------------------------------------------------------

    self.$toggleButtons.on('click', function () {
      var storyId = this.getAttribute('data-id');

      self.changeStory(storyId);
    });

    self.$nextButton.on('click', function () {
      var currentIndex = $('.mentor-story-nav a').index($('.mentor-story-nav a.active'));
      var storyId = self.getStoryByNumber(currentIndex + 1);

      self.changeStory(storyId);
    });

    self.$backButton.on('click', function () {
      var currentIndex = $('.mentor-story-nav a').index($('.mentor-story-nav a.active'));
      var storyId = self.getStoryByNumber(currentIndex - 1);

      self.changeStory(storyId);
    });
  };

  Carousel.prototype.changeStory = function (storyId) {
    var self = this;
    var $posterWrapper = $('#poster-' + storyId);
    var $posterImg = $('img', $posterWrapper);

    function showStory() {
      $posterWrapper.css('background-image', 'url(' + $posterImg.data('src') + ')').addClass('active');
      self.imageLoading = false;
    }

    self.$toggleButtons.removeClass('active');

    $('.mentor-story-nav a[data-id="' + storyId + '"]').addClass('active');
    $('.mentor-stories article.active').removeClass('active');
    $('.poster-image-container > div.active').removeClass('active');
    $('#story-' + storyId).addClass('active');

    self.imageLoading = true;

    // Lazy load poster frame if needed
    if (!$posterImg.attr('src')) {
      self.showSpinner();

      $posterImg.one('load', function () {
        self.$spinner.hide();
        showStory();
      });

      $posterImg.attr('src', $posterImg.data('src'));
    } else {
      showStory();
    }

    var currentIndex = $('.mentor-story-nav a').index($('.mentor-story-nav a.active'));

    if (currentIndex === 0) {
      self.$backButton.hide();
    } else {
      self.$backButton.show();
    }

    if (currentIndex >= self.totalStories - 1) {
      self.$nextButton.hide();
    } else {
      self.$nextButton.show();
    }
  };

  Carousel.prototype.showSpinner = function () {
    var self = this;

    // Delay showing spinner a bit in case image is cached or loads fast
    setTimeout(function () {
      if (self.imageLoading) {
        self.$spinner.show();
      }
    }, 500);
  };

  Carousel.prototype.getStoryByNumber = function (n) {
    var self = this;

    // Convert 0 index > selector nth-child, which starts with one
    n = n + 1;
    return self.$toggleButtonContainer.find('a:nth-child(' + n + ')').attr('data-id');
  };

  return Carousel;
});
