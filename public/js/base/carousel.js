define(['jquery', 'jquery-carousel'], function($, $carousel) {
  'use strict';
  // variables & setup
  var $arrows = $('.cta-arrow');
  var page;


  // grab CTA data
  var cta = [{
    "title": "Tools",
    "desc": "Get started with Thimble, Popcorn or X-Ray Goggles.",
    "image": "http://lorempixel.com/75/75/",
    "url": "http://google.com"
  },
  {
    "title": "Skills",
    "desc": "Learn new digital and tech skills – and earn badges that prove it.",
    "image": "http://lorempixel.com/75/75/",
    "url": "http://google.com"
  },
  {
    "title": "Guides",
    "desc": "Teach digital literacy through fun making and sharing.",
    "image": "http://lorempixel.com/75/75/",
    "url": "http://google.com"
  },
  {
    "title": "Party",
    "desc": "Now to Sept 15: get together at Maker Party events everywhere.",
    "image": "http://lorempixel.com/75/75/",
    "url": "http://google.com"
  },
  {
    "title": "Tools",
    "desc": "Get started with Thimble, Popcorn or X-Ray Goggles.",
    "image": "http://lorempixel.com/75/75/",
    "url": "http://google.com"
  }];


  function init(page) {
    this.page = page.page;
  }

  function attachToCTA() {
    var frag = document.createDocumentFragment();
    switch(this.page) {
      case 'index':
	if(cta.length > 4) {
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
	  items: 4,
	  circular: false,
	  infinite: false,
	  scroll: { fx: 'directscroll', items: 1 },
	  auto: { play: false },
	  prev: { button: $('.c-leftarrow') },
	  next: { button: $('.c-rightarrow') }
	}
	$('.make-wrapper').carouFredSel(carouOptions);
      break;
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

  function attachToPartners() {
    var $partners = $('.sponsors');

    var carouOptions = {
      items: 3,
      align: 'center',
      width: '100%',
      scroll: { fx: 'fade', items: 3 },
      next: { button: $('.refresh-sponsors') }
    }
    $partners.carouFredSel(carouOptions);
  }

  var self = {
    init: init,
    attachToCTA: attachToCTA,
    attachToPartners: attachToPartners
  }
  return self;
});
