define(["jquery", "localized", "nunjucks", "base/ui", "moment", "uri", "makeapi", "masonry"],
  function ($, localized, nunjucks, UI, moment, URI, Make, Masonry) {
    "use strict";

    var MAKE_VIEW = "make-templates/make-admin-search.html",
      MAKE_URL = $("body").data("endpoint"),
      LIMIT = 12,
      STICKY_PREFIX = "webmaker:teach-",

      $loadMore = $(".load-more"),
      $loading = $(".loading-cat"),
      $emptyMessage = $(".no-makes-found"),
      stampBanner = document.querySelector(".stamp"),
      mainGallery = document.querySelector(".main-gallery"),
      $mainGallery = $(mainGallery),
      $header = $("header"),
      $sidebar = $(".admin-sidebar "),
      $adminSearch = $("#admin-search-input"),
      searchResults = document.getElementById("search-results"),
      $searchResults = $(searchResults),
      lastQuery,
      makeAPIUrl = $("body").data("endpoint"),
      makeAPIUrlHost = URI.parse(makeAPIUrl).host,
      queryKeys = URI.parse(window.location.href).queryKey,
      lang = $('html').attr('lang');

    moment.lang(localized.langToMomentJSLang(lang));

    nunjucks.env = new nunjucks.Environment(new nunjucks.HttpLoader("/views", true));

    // Making a custom filter to use it for the client-side l10n
    // Using this filter will help reduce the number of adding
    // variables to the global nunjucks variable.
    // The usage will be "{{ "some string" | gettext }}"
    nunjucks.env.addFilter('gettext', function (data) {
      return localized.get(data);
    });

    // Set up masonry
    var masonry = new Masonry(mainGallery, {
      itemSelector: "div.make",
      gutter: ".gutter-sizer"
    });

    masonry.on("layoutComplete", function () {
      $(".gallery-hide", $mainGallery).removeClass("gallery-hide");
    });

    var searchMasonry = new Masonry(searchResults, {
      itemSelector: "div.make",
      gutter: 10
    });

    // Create make client for teach, set up default options
    var make = new Make({
      apiURL: MAKE_URL
    });

    function generateGravatar(hash) {
      // TODO: Combine with makeapi-webmaker.js into universal module
      var DEFAULT_AVATAR = "https%3A%2F%2Fstuff.webmaker.org%2Favatars%2Fwebmaker-avatar-44x44.png",
        DEFAULT_SIZE = 44;
      return "https://secure.gravatar.com/avatar/" + hash + "?s=" + DEFAULT_SIZE + "&d=" + DEFAULT_AVATAR;
    }

    function resultsCallback(err, data, total) {
      var oldMakes = searchResults.querySelectorAll(".make");
      var showingString = total ? ("Showing pg. " + lastQuery.page + " of " + total) : "No";
      if (oldMakes.length) {
        searchMasonry.remove(oldMakes);
      }
      $loading.hide();
      $(".search-summary").html(showingString + " results for " + lastQuery.field + " = " + lastQuery.value + " on " + "<a href=\"" + makeAPIUrl + "/admin\">" + makeAPIUrlHost + "</a>");
      UI.pagination(lastQuery.page, total, LIMIT, function (page) {
        lastQuery.page = page;
        doSearch(lastQuery);
      });
      if (err || !data.length) {
        return;
      }
      for (var i = 0; i < data.length; i++) {
        if (data[i]) {
          data[i].avatar = generateGravatar(data[i].emailHash);
          data[i].updatedAt = moment(data[i].updatedAt).fromNow();
          data[i].createdAt = moment(data[i].createdAt).fromNow();
          data[i].remixurl = data[i].url + "/remix";
          var $item = $($.parseHTML(nunjucks.env.render(MAKE_VIEW, {
            make: data[i]
          }))[0]);
          $searchResults.prepend($item);
          searchMasonry.appended($item[0]);
        }
      }
      searchMasonry.layout();
    }

    if (stampBanner) {
      masonry.stamp(stampBanner);
      masonry.layout();
    }

    var scrollTop = $sidebar.offset().top;
    $(window).scroll(function (e) {
      var windowTop = $(window).scrollTop();
      if (windowTop > scrollTop) {
        $sidebar.css("top", "0");
      } else {
        $sidebar.css("top", scrollTop - windowTop);
      }
    });

    function doSearch(options) {
      options = options || {};

      options.field = options.field || $(".search-type label.active").data("field");
      options.value = options.value || $adminSearch.val();
      options.limit = options.limit || LIMIT;
      options.sortByField = options.sortByField || "createdAt";
      options.sortByDirection = options.sortByDirection || "desc";
      options.page = options.page || 1;

      lastQuery = options;

      var searchQuery = {
        limit: options.limit,
        sortByField: [options.sortByField, options.sortByDirection],
        page: options.page
      };

      searchQuery[options.field] = options.value;
      localized.ready(function () {
        make.find(searchQuery).then(resultsCallback);
      });
    }

    //Choosing field
    $(".search-type label").click(function (e) {
      $(".search-type label.active").removeClass("active");
      $(this).addClass("active");
      doSearch({
        field: $(this).data("field")
      });
    });

    UI.select("#filter", function (val) {
      lastQuery.sortByField = val;
      lastQuery.page = 1;
      doSearch(lastQuery);
    });

    UI.select("#prefix-select", function (val) {
      queryKeys.prefix = val;
      window.location.search = $.param(queryKeys);
    });

    UI.select("#layout-select", function (val) {
      queryKeys.layout = val;
      window.location.search = $.param(queryKeys);
    });

    $adminSearch.bind("keypress", function (e) {
      var code = (e.keyCode ? e.keyCode : e.which);
      if (code === 13) { //Enter keycode
        doSearch();
      }
    });

    doSearch();

  });
