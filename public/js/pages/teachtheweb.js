define(['jquery'],
  function ($) {

  var $window = $(window);
  var $toggleButtons = $('.mentor-story-nav a');
  var $articles = $('.mentor-stories article');
  var $posters = $('.poster-image-container > div');
  var $hiddenScroll = $('.hidden-scroll');
  var gallery = document.querySelector('.make-now-templates');
  var hideScrollTimeout;

  function changeStory(e) {
    var storyId = 'brooklyn';
    if (e) {
      storyId = this.getAttribute('data-id');
    }
    $toggleButtons.removeClass('active');
    $('.mentor-story-nav a[data-id="' + storyId +'"]').addClass('active');
    $('.mentor-stories article.active').removeClass('active');
    $('.poster-image-container > div.active').removeClass('active');
    $('#story-' + storyId).addClass('active');
    $('#poster-' + storyId).addClass('active');
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

  $('#make-something').click( function() {
    $('html, body').animate({ scrollTop: $('.make-something-now').offset().top }, 1000);
  });

  var packery = new Packery(gallery, {
    itemSelector: '.make-now-templates > article',
    gutter: '.gutter-make-now'
  });

  $toggleButtons.on('click', changeStory);

});
