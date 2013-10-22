define(['jquery'], function ($) {
  'use strict';

  var $body = $('body'),
    cta;

  // Pull page specific JSON from script block in DOM
  cta = JSON.parse($('#block-cta').text());

  function attachToCTA() {
    var frag = document.createDocumentFragment();

    for (var i = 0; i < cta.length; ++i) {
      var item = createCTA({
        "title": cta[i].title,
        "desc": cta[i].desc,
        "image": cta[i].image,
        "url": cta[i].url
      });

      $('.make-wrapper').append(item);
    }
  }

  function createCTA(itemObj) {
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
    $title_span.html(title);

    var $desc_span = $('<span class="make-footer-item-desc">');
    $desc_span.html(desc);

    $div.append($title_span);
    $div.append($desc_span);

    $a.append($img);
    $a.append($div);

    $make_item_template.append($a);

    return $make_item_template;
  }

  return {
    attachToCTA: attachToCTA
  };

});
