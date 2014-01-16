define(["jquery", "uri", "base/ui", "masonry", "jquery-ui.autocomplete"],
  function ($, URI, UI, Masonry) {
    "use strict";

    var query = $(".search-poster").attr("data-query"),
      queryKeys = URI.parse(window.location.href).queryKey,
      $searchPoster = $(".search-poster"),
      $searchField = $("#search-field"),
      $searchFilter = $("#search-type"),
      $forkBtns = $(".make-fork-btn"),
      $userNameLinks = $(".user-link"),
      mainGallery = $(".main-gallery")[0],
      tagSuggestionEnabled = false,
      totalHits,
      LIMIT,
      masonry,
      page;

    function onKeyDown() {
      $("html, body").animate({
        scrollTop: 0
      }, 200);
      $searchPoster.addClass("focus");
      $searchField.off("keydown", onKeyDown);
    }

    $searchField.click(function () {
      $searchField.select();
    });

    // Show the big green UI
    if ($searchPoster.hasClass("focus") && query) {
      $searchField.val(query.replace(/,/g, ", "));
      onKeyDown();
    } else {
      $searchField.on("keydown", onKeyDown);
    }

    $searchField.autocomplete({
      source: function (request, response) {
        var term = request.term;
        if (term === "#") {
          return response();
        }
        $.getJSON($("meta[name='make-endpoint']").attr("content") + "/api/20130724/make/tags?t=" + term.replace(/(^#)/, ""), function (data) {
          response(data.tags.map(function (item) {
            return item.term;
          }));
        });
      },
      minLength: 1,
      delay: 200,
      select: function (e, ui) {
        $searchField.val(ui.item.value);
        $(".search-wrapper").submit();
      }
    });

    function enableTagSuggestion() {
      $searchField.autocomplete("enable");
      tagSuggestionEnabled = true;
    }

    function disableTagSuggestion() {
      $searchField.autocomplete("disable");
      tagSuggestionEnabled = false;
    }

    if ($searchFilter.find("[name=type]").val() === "tags") {
      enableTagSuggestion();
    } else {
      disableTagSuggestion();
    }

    // Setup masonry
    masonry = new Masonry(mainGallery, {
      itemSelector: "div.make",
      gutter: ".gutter-sizer",
      transitionDuration: "0.2"
    });

    // Change what kind of search
    $searchFilter.find("li").click(function () {
      var $this = $(this),
        type = $this.attr("data-value");
      $searchFilter.find("[name=type]").val(type);
      $searchFilter.find("[data-selected] > span").attr("class", "icon-" + type);
      $searchFilter.find(".ui-on").removeClass("ui-on");
      $this.addClass("ui-on");
      if (!tagSuggestionEnabled && type === "tags") {
        enableTagSuggestion();
      } else if (tagSuggestionEnabled) {
        disableTagSuggestion();
      }
    });

    $forkBtns.click(function (e) {
      e.stopPropagation();
    });

    $userNameLinks.click(function (e) {
      e.stopPropagation();
      queryKeys.page = 1;
      queryKeys.type = "user";
      queryKeys.q = this.getAttribute("data-username");
      window.location.search = $.param(queryKeys);
    });

    page = queryKeys.page ? parseInt(queryKeys.page, 10) : 1;

    if (mainGallery) {
      totalHits = mainGallery.getAttribute("data-total-hits");
      LIMIT = mainGallery.getAttribute("data-limit");

      UI.pagination(page, totalHits, LIMIT, function (page) {
        queryKeys.page = page;

        if (queryKeys.q) {
          queryKeys.q = decodeURIComponent(queryKeys.q);
        }

        window.location.search = $.param(queryKeys);
      });
    }

  });
