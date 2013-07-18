define(["jquery", "uri" ],
  function ($, URI) {
  "use strict";

  var query = $(".search-poster").attr( "data-query"),
      queryKeys = URI.parse( window.location.href ).queryKey,
      $searchPoster = $(".search-poster"),
      $searchField = $("#search-field"),
      $searchFilter = $("#search-type"),
      $forkBtns = $(".make-fork-btn"),
      $userNameLinks = $(".user-link"),
      $nextBtn = $(".next-page"),
      $prevBtn = $(".previous-page"),
      $makes = $(".make"),
      mainGallery = $(".main-gallery")[0],
      packery;

  function onKeyDown() {
    $("html, body").animate({ scrollTop: 0 }, 200 );
    $searchPoster.addClass( "focus");
    $searchField.off("keydown", onKeyDown);
  }

  // Show the big green UI
  if ($searchPoster.hasClass("focus") && query) {
    $searchField.val(query.replace(/,/g,", "));
    onKeyDown();
  } else {
    $searchField.on("keydown", onKeyDown);
  }

  // Setup packery
  packery = new Packery( mainGallery, {
    itemSelector: "div.make",
    gutter: ".gutter-sizer",
    transitionDuration: "0.2"
  });

  // Change what kind of search
  $searchFilter.find("li").click( function(){
    var $this = $(this),
        type = $this.attr("data-value");
    $searchFilter.find("[name=type]").val( type );
    $searchFilter.find("[data-selected] > span").attr("class", "icon-" + type);
    $searchFilter.find(".ui-on").removeClass("ui-on");
    $this.addClass("ui-on");
  });

  $forkBtns.click( function(e) {
    e.stopPropagation();
  });

  $userNameLinks.click( function(e) {
    e.stopPropagation();
    queryKeys.page = 1;
    queryKeys.type = "user";
    queryKeys.q = this.getAttribute("data-username");
    window.location.search = $.param(queryKeys);
  });

  // Pagination
  $nextBtn.click( function(e) {
    queryKeys.page = queryKeys.page ? parseInt(queryKeys.page, 10) + 1 : 2;

    if (queryKeys.q) {
      queryKeys.q = decodeURIComponent(queryKeys.q);
    }

    window.location.search = $.param( queryKeys );
  });
  $prevBtn.click( function(e) {
    queryKeys.page = queryKeys.page > 1 ? parseInt(queryKeys.page, 10) - 1 : 1;

    if (queryKeys.q) {
      queryKeys.q = decodeURIComponent(queryKeys.q);
    }

    window.location.search = $.param( queryKeys );
  });

});
