define(['jquery', 'masonry', 'base/lazy-loader', 'pages/home-carousel', 'base/login'],
  function ($, Masonry, lazyLoader, Carousel, webmakerAuth) {
    new Carousel($('.mentor-stories'));
    var $hiddenScroll = $('.hidden-scroll');
    var gallery = document.querySelector('.make-now-templates');
    var hideScrollTimeout;

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

    $(window).on('scroll', onScroll);

    $('#make-something').click(function () {
      $('html, body').animate({
        scrollTop: $('.make-something-now').offset().top
      }, 1000);
    });

    $('#join-us').click(webmakerAuth.login).show();

    webmakerAuth.on('login', function () {
      $('#join-us').hide();
    });

    webmakerAuth.on('logout', function () {
      $('#join-us').show();
    });

    webmakerAuth.on('verified', function (user) {
      if (user) {
        $('#join-us').hide();
      }
    });

    new Masonry(gallery, {
      itemSelector: '.make-now-templates > article',
      gutter: '.gutter-make-now'
    });

    // Wait until starter make thumbs are in view before loading imgs
    lazyLoader.init($('.make-something-now img')).loadVisibleImages();

    webmakerAuth.verify();
  });
