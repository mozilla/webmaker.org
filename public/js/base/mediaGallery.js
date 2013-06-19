define(['jquery', 'moment'],
  function ($, moment) {
  'use strict';

  var countLarge = 2,
      countMedium = 8,
      LIMIT_DESKTOP = 20,
      LIMIT_MOBILE = 6,
      currentIter = 1,
      defaultAvatar = "http%3A%2F%2Fstuff.webmaker.org%2Favatars%2Fwebmaker-avatar-44x44.png";

  var $body = $( 'body' ),
      $mainGallery = $('.main-gallery'),
      mainGallery = $mainGallery[0],
      $makeTemplate = $body.find( 'div.make' ),
      $makeBackTemplate = $body.find( 'div.make-back' ),
      $loading = $( '.loading', $mainGallery ),
      isMobile = false;

  function createMakeBack( data, $el ) {
    var $backTemplate = $makeBackTemplate.clone( true ),
        $placeSpan = $('.place', $backTemplate),
        $titleLink = $('.title', $backTemplate),
        $dateSpan = $('.date', $backTemplate),
        $authorLink = $('.author', $backTemplate),
        $descSpan = $('.description', $backTemplate),
        $typeSpan = $('.type', $backTemplate),
        $viewBtn = $('.view-btn', $backTemplate),
        $forkBtn = $('.fork-btn', $backTemplate),
        $detailsBtn = $('.details-btn', $backTemplate),
        $avatar = $('.make-avatar'),
        createdAtDate = moment( new Date( data.createdAt ) ).fromNow();
        // Note that this is not working... no createdAt?

    // Limit description length
    if ( data.description.length > 370 ) {
      data.description = data.description.slice(0,370) + "...";
    }

    $typeSpan.text( data.type );
    $titleLink.text( data.title );
    $titleLink.attr( "href", data.url );
    $dateSpan.text( createdAtDate );
    $authorLink.text( "@" + data.username );
    $authorLink.attr( "href", "/u/" + data.username );
    $viewBtn.attr( "href", data.url );
    $forkBtn.attr( "href", data.url + '/remix' );
    $detailsBtn.attr( "href", data.url );
    $descSpan.text( data.description );
    $avatar.attr( "src", "https://secure.gravatar.com/avatar/" + data.emailHash + "?s=44&d=" + defaultAvatar );
    // Note that the remix url doesn't exist right now?

    $el.append( $backTemplate );
  }

  function searchCallback( data, self ) {
    var $makeContainer = $makeTemplate.clone( true ).addClass('rf'),
        makeContainer = $makeContainer[0],
        randSize = 'large';

    // Make these easier to use
    if ( data.tags.guide ) {
      data.type = "guide";
    } else {
      data.type = data.contentType.replace( /application\/x\-/g, "" );
    }

    // the home page and the medium size for the teach page.

    switch( $body[0].id ) {
      case 'index':
        if (countLarge > 0 && ( currentIter === 3 || currentIter === 4 ) ) {
          randSize = 'large';
          countLarge --;
        } else {
          randSize = 'medium';
          countMedium --;
        }
        ++currentIter;
        break;

      case 'teach':
        randSize = 'medium';
        break;
    }

    // create front Element & populate
    var $frontEl = $('<div class="front make-thumbnail">' + '<div class="front-title">' + data.title + '</div></div></div>');

    // if there's a thumbnail, set the right css
    if ( data.thumbnail ) {
      $frontEl.addClass( "thumbnail" ).css( "background-image", "url(" + data.thumbnail + ")" );
    }

    // create back element & populate
    var $backEl = $('<div class="back"></div>');
    var tags = data.tags;

    $makeContainer.addClass( 'make-type-' + data.type );
    $makeContainer.addClass(randSize);

    createMakeBack( data, $backEl );

    // add front & back elements to flip container
    var $flip = $('<a href="'+ data.url +'" class="flipContainer"></a>');

    $flip.append($frontEl).append( $backEl );

    // add flip container & link to make container
    //var $a = $('<a href="' + data.url + '"></a>');
    $makeContainer.append( $flip );

    // add to gallery & packery
    $mainGallery.append( $makeContainer );
    self.packery.appended( makeContainer );
  }

  var MediaGallery = function(webmaker) {

    this.limit = LIMIT_DESKTOP;
    this.wm = webmaker;
    this.packery = new Packery(mainGallery, {
      itemSelector: 'div.make',
      gutter: '.gutter-sizer',
      transitionDuration: '0.2s'
    });
    this.lastSearch = $body[0].id === 'teach' ?
      { tags: [ 'webmaker:recommended', 'guide' ] } :
      { tags: [ 'webmaker:recommended' ] };
    this.pageNo = 1;

    this.packery.on( 'layoutComplete', function() {
      $loading.hide();
      $('.packery-hide', $mainGallery ).removeClass( 'packery-hide' );
    });

    this.packery.layout();

    // Detect whether we are in mobile dimensions or not.
    if (isMobile) {
      this.limit = LIMIT_MOBILE;
    }
  };

  MediaGallery.prototype.layout = function() {
    this.packery.layout();
  };

  MediaGallery.prototype.init = function() {
    var self = this,
        $stickyBanner;

    var loginUrl = $("meta[name='login-url']").attr("content");

    // Handles all packery-related content loading.
    switch ($body[0].id) {
      case 'template':
        break;
      case 'index':
        $stickyBanner = $('<div class="make internal rf packery-hide" id="banner-join">');
        var $rotator = $('<div class="rotator">');
        var $theweb = $('<h2>');
        $rotator.append($theweb);
        var stampHeaders = [
          'The web is still wild.<br> Build it.',
          'The web is still open.<br> Hack it.',
          'The web is still weird.<br> Create it.',
          'The web is still fun.<br> Make it.'
        ];

        // for (var i = 0, l = stampHeaders.length; i < l; i ++) {
        //   $rotator.append('<h2>' + stampHeaders[i] + '</h2>');
        // }

        var $borderDiv = $('<div class="join-border">');
        var $signinDiv = $('<div class="join-signin">');
        var $signin = $('<span class="btn-join-container"><a href="/login" class="ui-blue-btn btn-signin">Sign in<i class="icon-angle-right"></i></a></span>');
        var $claim = $('<span class="join-claim">').text('Claim your webmaker domain.');

        $signinDiv.append($claim);
        $signinDiv.append($signin);

        $stickyBanner.append( $rotator );
        $stickyBanner.append( $borderDiv );
        $stickyBanner.append( $signinDiv );

        $mainGallery.append( $stickyBanner );

        this.packery.stamp( $stickyBanner[0] );
        this.packery.layout();

        var carouselTime = 5; // seconds
        var iterate = 0;

        // initial population
        var v = stampHeaders[iterate];
        $theweb.html(v);
        iterate++;

        var interval = setInterval(function(){
          var v = stampHeaders[iterate];
          $theweb.fadeOut(500, function() {
            $(this).html(v).fadeIn(500);
          });
          iterate++;
          if (iterate === stampHeaders.length - 1) iterate = 0;
        }, carouselTime * 1000);

        // set up mouse over handlers
        $makeTemplate.addClass( "make-flip" );
        $makeTemplate.on('mouseenter focusin', function ( e ) {
          $('.flipContainer', this).addClass( 'flip' );
        });
        $makeTemplate.on('mouseleave focusout', function ( e ) {
          $('.flipContainer', this).removeClass( 'flip' );
        });
        $makeTemplate.on('touchend', function ( e ) {
          e.preventDefault();
          if( $( e.target ).hasClass( 'front' ) ||
               $( e.target ).hasClass( 'back' ) ||
               $( e.target ).hasClass( 'make-back' )  ) {
            $('.flipContainer', this).toggleClass( 'flip' );
          }
          else if ( e.target.nodeName === 'A') {
            e.target.click();
          }
          else {
            return false;
          }
        });

        this.wm.doSearch( { tags: ['webmaker:recommended'] }, this.limit, function( data ) {
          searchCallback( data, self );
        });
        break;

      case 'teach':
        $stickyBanner = $('<div id="banner-teach" class="rf packery-hide">' +
          '<img src="/img/webmaker-community.jpg" alt="Webmaker Community"><div class="joinBorder"></div>' +
          "<p>We're a <a href='/about'/>global community</a> of friendly humans on " +
          "a mission to  help people learn the building blocks of the web.<br><a href='/mentor'> " +
          "<button class='ui-blue-btn'>Explore our mentoring program <i class='icon-angle-right'> " +
          "</i></button></a></p></div>");

        $mainGallery.append( $stickyBanner );
        this.limit = 12;

        $makeTemplate.addClass( "make-teach" );

        this.wm.doSearch( { tags: ['webmaker:recommended', 'guide'] }, this.limit, function( data ) {
          searchCallback( data, self );
        });
        this.packery.stamp( $stickyBanner[0] );
        this.packery.layout();
        break;
    }
  };

  MediaGallery.prototype.loadMore = function () {
    var self = this;
    var pageNo = ++this.pageNo;
    this.wm.doSearch( this.lastSearch, this.limit, function( data ) {
      searchCallback( data, self );
    }, pageNo );
  };

  MediaGallery.prototype.search = function( options ) {
    var self = this;
    this.pageNo = 1;
    this.lastSearch = options;
    $('.rf').remove();
    $loading.show();

    // Every time we redraw all the elements, we need to recreate Packery or else
    // it draws the layout based on the previous setup.
    this.packery = new Packery(mainGallery, {
      itemSelector: 'div.make',
      gutter: '.gutter-sizer',
      transitionDuration: '0.2'
    });
    this.packery.on( 'layoutComplete', function() {
      $loading.hide();
    });
    this.limit = 16;
    this.wm.doSearch( options, this.limit, function( data ) {
      searchCallback( data, self );
    });
    this.packery.layout();
  };

  return MediaGallery;
});
