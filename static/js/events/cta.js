define(['jquery', 'jquery.carousel'], function($) {
  'use strict';
  // variables & setup
  var $arrows = $('.cta-arrow'),
      $body = $('body'),
      isMobile = false,
      page,
      DEFAULT_FOOTER_ITEM_WIDTH = 245;

  if ($body.find( '.mobile' ).css( 'display' ) === 'none') {
    isMobile = true;
  }


var cta = [
    {
        title:  "Event Guides",
        url:    "/guides",
        image:  "http://lorempixel.com/75/75/",
        desc:   "Step-by-step guides for event planning."
    },
    {
        title:  "Maker Party",
        url:    "/party",
        image:  "http://lorempixel.com/75/75/",
        desc:   "From now to September 15, join other webmakers in a global Maker Party."
    },
    {
        title:  "Teach",
        url:    "/teach",
        image:  "http://lorempixel.com/75/75/",
        desc:   "Resources for teaching digital literacy and webmaking."
    },
    {
        title:  "Get Involved",
        url:    "/getinvolved",
        image:  "http://lorempixel.com/75/75/",
        desc:   "Need help? Access support and connect with the Webmaker community."
    },
]

  function attachToCTA(cta) {
    var frag = document.createDocumentFragment();

    if(cta.length > 4 && !isMobile) {
      $arrows.show();
    }

    for(var i = 0; i < cta.length; ++i) {
      var item = createCTA({
        "title": cta[i].title,
        "desc": cta[i].desc,
        "image": cta[i].image,
        "url": cta[i].url
      });

      $('.make-wrapper').append(item);
    }

    var carouOptions = {
      height: 125,
      items: {
        visible: 4,
        width: DEFAULT_FOOTER_ITEM_WIDTH
      },
      circular: false,
      infinite: false,
      scroll: { fx: 'directscroll', items: 1 },
      auto: { play: false },
      prev: { button: $('.c-leftarrow') },
      next: { button: $('.c-rightarrow') }
    };

    if (!isMobile) {
      $('.make-wrapper').carouFredSel(carouOptions);
    }
  }

  function createCTA(itemObj){
    var title = itemObj.title,
    desc = itemObj.desc,
    image = itemObj.image,
    url = itemObj.url;

    var $make_item_template = $('<div class="make-footer-item">');
    var $div = $('<div class="make-footer-item-text">');

    var $img = $('<img class="make-footer-item-img">');
    $img.attr('src', image);

    var $a = $('<a>');
    $a.attr('href', url);

    var $title_span = $('<span class="make-footer-item-title">');
    $title_span.text(title);

    var $desc_span = $('<span class="make-footer-item-desc">');
    $desc_span.text(desc);

    $div.append($title_span);
    $div.append($desc_span);

    $a.append($img);
    $a.append($div);

    $make_item_template.append($a);

    return $make_item_template;
  }
  attachToCTA(cta);
});
