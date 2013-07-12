define(["jquery", "nunjucks", "base/ui", "moment"],
  function ($, nunjucks, UI, moment) {
  "use strict";

  var MAKE_VIEW = "make-templates/make-teach.html";
  var MAKE_URL = $("body").data("endpoint");
  var LIMIT = 12;
  var STICKY_PREFIX = "webmaker:teach-";

  var $loadMore = $(".load-more");
  var $loading = $(".loading-cat");
  var $emptyMessage = $(".no-makes-found");
  var stickyBanner = document.getElementById("banner-teach");
  var mainGallery = document.querySelector(".main-gallery");
  var $mainGallery= $(mainGallery);

  nunjucks.env = new nunjucks.Environment(new nunjucks.HttpLoader("/views", true));

  // How many makes are there initially?
  var totalMakes = $(".make").length;

  // Set up packery
  var packery = new Packery(mainGallery, {
    itemSelector: "div.make",
    gutter: ".gutter-sizer"
  });

  // Create make client for teach, set up default options
  var make = new Make({apiURL: MAKE_URL});
  var options = {
    tagPrefix: [STICKY_PREFIX, true], // NOT sticky
    tags: {tags:["webmaker:recommended", "guide"]},
    limit: LIMIT,
    page: 1
  };

  function isLastPage() {
    return options.page >= Math.ceil(totalMakes/options.limit);
  }

  function onLoadUI() {
    $loading.fadeOut();
    $(".packery-hide").removeClass("packery-hide");
    if (isLastPage()) {
      $loadMore.hide();
    } else {
      $loadMore.show();
    }
  }

  function generateGravatar(hash) {
    // TODO: Combine with makeapi-webmaker.js into universal module
    var DEFAULT_AVATAR = "https%3A%2F%2Fstuff.webmaker.org%2Favatars%2Fwebmaker-avatar-44x44.png",
        DEFAULT_SIZE = 44;
    return "https://secure.gravatar.com/avatar/" + hash + "?s="+ DEFAULT_SIZE +"&d=" + DEFAULT_AVATAR;
  }

  function resultsCallback(err, data, total) {
    $loading.hide();
    if (err || !data.length) {
      $emptyMessage.fadeIn();
      return;
    }
    totalMakes = total;
    var elems = [];
    for (var i=0; i<data.length; i++) {
      if (data[i]) {
        data[i].avatar = generateGravatar(data[i].emailHash);
        data[i].updatedAt = moment( data[i].updatedAt ).fromNow();
        data[i].createdAt = moment( data[i].createdAt ).fromNow();
        data[i].remixurl = data[i].url + "/remix";
        var $item = $.parseHTML(nunjucks.env.render(MAKE_VIEW, {make: data[i]}));
        $mainGallery.append($item);
        elems.push($item[0]);
      }
    }
    packery.appended(elems);
    packery.layout();
    onLoadUI();
  }

  packery.on("layoutComplete", onLoadUI);
  packery.stamp(stickyBanner);
  packery.layout();

  UI.select( '#search-filter', function( val ) {
    var makes = document.querySelectorAll('.make');
    switch ( val ) {
      case 'dummy':
        options.tags = {tags:[ 'webmaker:recommended', 'guide' ]};
        options.sortByField = ['createdAt', 'desc'];
        delete options.contentType;
        break;

      case 'featured':
        options.tags = {tags:[ 'webmaker:featured', 'guide' ]};
        options.sortByField = ['createdAt', 'desc'];
        delete options.contentType;
        break;

      case 'popcorn':
        options.tags = {tags:[ 'guide' ]};
        options.sortByField = ['createdAt', 'desc'];
        options.contentType = 'application/x-popcorn';
        break;

      case 'thimble':
        options.tags = {tags:[ 'guide' ]};
        options.sortByField = ['createdAt', 'desc'];
        options.contentType = 'application/x-thimble';
        break;
    }
    // Reset!
    options.page = 1;
    if (makes.length) {
      packery.remove(makes);
    }
    $emptyMessage.hide();
    $loading.show();
    make.find(options).then(resultsCallback);
  });

  $loadMore.click( function() {
    options.page++;
    $loading.show();
    make.find(options).then(resultsCallback);
  });

});
