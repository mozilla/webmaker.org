define(['jquery', 'masonry'],
  function ($, Masonry) {

    var $window = $(window);
    var $toggleButtonContainer = $('.mentor-story-nav');
    var $toggleButtons = $('.mentor-story-nav a');
    var totalStories = $('.mentor-story-nav a').length;
    var $nextButton = $('.go-forward');
    var $backButton = $('.go-back');
    var $articles = $('.mentor-stories article');
    var $posters = $('.poster-image-container > div');
    var $hiddenScroll = $('.hidden-scroll');
    var gallery = document.querySelector('.make-now-templates');
    var hideScrollTimeout;

    function changeStory(storyId) {
      $toggleButtons.removeClass('active');
      $('.mentor-story-nav a[data-id="' + storyId + '"]').addClass('active');
      $('.mentor-stories article.active').removeClass('active');
      $('.poster-image-container > div.active').removeClass('active');
      $('#story-' + storyId).addClass('active');
      $('#poster-' + storyId).addClass('active');

      var currentIndex = $('.mentor-story-nav a').index($('.mentor-story-nav a.active'));
      if (currentIndex === 0) {
        $backButton.hide();
      } else {
        $backButton.show();
      }
      if (currentIndex >= totalStories - 1) {
        $nextButton.hide();
      } else {
        $nextButton.show();
      }
    }

    function getStoryByNumber(n) {
      // Convert 0 index > selector nth-child, which starts with one
      n = n + 1;
      return $toggleButtonContainer.find('a:nth-child(' + n + ')').attr('data-id');
    }

    function hideScroll() {
      $hiddenScroll.addClass('hidden-scroll');
    }

    function onScroll() {
      $hiddenScroll.removeClass('hidden-scroll');
      if (hideScrollTimeout) {
        clearTimeout(hideScrollTimeout);
      }
      hideScrollTimeout = setTimeout(hideScroll, 1000);
    }

    $window.on('scroll', onScroll);

    $('#make-something').click(function () {
      $('html, body').animate({
        scrollTop: $('.make-something-now').offset().top
      }, 1000);
    });

    var masonry = new Masonry(gallery, {
      itemSelector: '.make-now-templates > article',
      gutter: '.gutter-make-now'
    });

    $toggleButtons.on('click', function () {
      var storyId = this.getAttribute('data-id');
      changeStory(storyId);
    });

    $nextButton.on('click', function () {
      var currentIndex = $('.mentor-story-nav a').index($('.mentor-story-nav a.active'));
      var storyId = getStoryByNumber(currentIndex + 1);
      changeStory(storyId);
    });

    $backButton.on('click', function () {
      var currentIndex = $('.mentor-story-nav a').index($('.mentor-story-nav a.active'));
      var storyId = getStoryByNumber(currentIndex - 1);
      changeStory(storyId);
    });

    var randomStoryIndex = Math.floor(Math.random() * totalStories) - 1;

    changeStory(getStoryByNumber(randomStoryIndex));
  });
