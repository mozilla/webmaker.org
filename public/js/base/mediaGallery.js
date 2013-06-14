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
        createdAtDate = moment( new Date( data.createdAt ) ).fromNow();
        // Note that this is not working... no createdAt?

    $typeSpan.text( data.type );
    $titleLink.text( data.title );
    $titleLink.attr( "href", data.url );
    $dateSpan.text( createdAtDate );
    $authorLink.text( "@" + data.username );
    $authorLink.attr( "href", "/u/" + data.username );
    $viewBtn.attr( "href", data.url );
    $forkBtn.attr( "href", data.url + '/remix' );
    $descSpan.text( data.description );
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
    var $frontEl = $('<div class="front make-thumbnail">' + "<img class='make-avatar' src='http://www.gravatar.com/avatar/" + data.emailHash + "?s=44&d=" + defaultAvatar + "' alt='" + data.emailHash + "'>" + '<div class="front-title">' + data.title + '</div></div></div>');

    // if there's a thumbnail, set the right css
    if ( data.thumbnail ) {
      $frontEl.addClass( "thumbnail" ).css( "background-image", "url(" + data.thumbnail + ")" );
    }

    // create back element & populate
    var $backEl = $('<div class="back"></div>');
    var tags = data.tags;

     if ( tags.template ) {
      $makeContainer.addClass( 'make-template' );
    }
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
    this.lastSearch = { tags: [ 'webmaker:featured', 'guide' ] };
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

    // Handles all packery-related content loading.
    switch ($body[0].id) {
      case 'template':
        break;
      case 'index':
        $stickyBanner = $('<div class="make internal rf packery-hide" id="banner-join">');
        var $rotator = $('<div class="rotator">');
        var stampHeaders = [
          'The web is still wild. Build it.',
          'The web is still open. Hack it.',
          'The web is still weird. Create it.',
          'The web is still fun. Make it.'
        ];

        for (var i = 0, l = stampHeaders.length; i < l; i ++) {
          $rotator.append('<h1>' + stampHeaders[i] + '</h1>');
        }

        var $h2 = $('<h2>Claim your Webmaker domain:</h2>');
        var $signin = $('<button class="ui-huge-button sign-in">Sign in!</button>');

        $signin.on('click', function( e ) {
          navigator.idSSO.request();
        } );

        $stickyBanner.append( $rotator );
        $stickyBanner.append( $h2 );
        $stickyBanner.append( $signin );

        $mainGallery.append( $stickyBanner );

        this.packery.stamp( $stickyBanner[0] );
        this.packery.layout();

        $('.rotator').carouFredSel({
          padding: [0, 0, 0, 20],
          scroll: { fx: 'crossfade', items: 1 },
          items: { width: '100%' }
        });

        // set up mouse over handlers
        $makeTemplate.addClass( "make-flip" );
        $makeTemplate.on('mouseenter focusin', function ( e ) {
          $('.flipContainer', this).addClass( 'flip' );
        });
        $makeTemplate.on('mouseleave focusout', function ( e ) {
          $('.flipContainer', this).removeClass( 'flip' );
        });

        this.wm.doSearch( { tags: ['webmaker:featured'] }, this.limit, function( data ) {
          searchCallback( data, self );
        });
        break;

      case 'teach':
        $stickyBanner = $('<div id="banner-teach" class="rf packery-hide">' +
          '<img src="/img/webmaker-community.jpg" alt="Webmaker Community">' +
          "<p>We're a <a href='/about'/>global community</a> of friendly humans on " +
          "a mission to  help people learn the building blocks of the web.<a href='/mentor'>Explore " +
          "our mentoring program.</p></div>");
        $mainGallery.append( $stickyBanner );
        this.limit = 12;

        $makeTemplate.addClass( "make-teach" );

        this.wm.doSearch( { tags: ['webmaker:featured', 'guide'] }, this.limit, function( data ) {
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
