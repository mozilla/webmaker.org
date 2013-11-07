define(['jquery', 'uri', 'base/ui', 'localized', 'masonry'],
  function ($, URI, UI, localized, Masonry) {
    'use strict';

    localized.ready(function () {
      var $body = $("body"),
        $makes = $(".make"),
        $deleteBtn = $(".delete-btn"),
        mainGallery = $(".main-gallery")[0],
        totalHits,
        LIMIT,
        queryKeys = URI.parse(window.location.href).queryKey,
        BASE_WIDTH = 240,
        GUTTER = 20,
        masonry,
        page;

      // Are we inside thimble or popcorn?
      var inApp = $body.hasClass("popcorn") || $body.hasClass("thimble");

      // If the user is not logged in yet,
      // refresh the page once they are.
      // This properly generates server side project data
      // for apps using my makes.
      if (inApp && !$("meta[name='persona-email']").attr("content")) {
        navigator.idSSO.app = {
          onlogin: function () {
            window.location.replace(window.location);
          }
        };
      }

      // Do we have any makes?
      if (!$makes.length) {
        return;
      }

      // Set up scrollable container
      if (inApp) {
        $(".webmaker-outer-wrapper").css("width", ((BASE_WIDTH + GUTTER) * $makes.length + GUTTER * 2) + "px");
        $("html").css("overflow-y", "hidden");
      }

      // Or, set up masonry if we are on webmaker.org
      if (!inApp) {
        masonry = new Masonry(mainGallery, {
          itemSelector: 'div.make',
          gutter: '.gutter-sizer',
          transitionDuration: '0.2'
        });
      }

      // Set up the delete buttons
      $deleteBtn.on("click", function (e) {
        e.preventDefault();
        var $this = $(this),
          makeID = $this.data("make-id");
        if (window.confirm(localized.get("Are you sure you want to delete this make?"))) {
          $.post("/remove", {
            makeID: makeID,
            _csrf: $("meta[name='X-CSRF-Token']").attr("content")
          }, function (res) {
            if (res.deletedAt) {
              if (!inApp) {
                masonry.remove($this.closest(".make")[0]);
                masonry.layout();
              } else {
                $this.closest(".make").remove();
              }
            }
          });
        }
      });

      page = queryKeys.page ? parseInt(queryKeys.page, 10) : 1;

      if (mainGallery) {
        totalHits = mainGallery.getAttribute("data-total-hits");
        LIMIT = mainGallery.getAttribute("data-limit");

        UI.pagination(page, totalHits, LIMIT, function (page) {
          queryKeys.page = page;
          window.location.search = $.param(queryKeys);
        });
      }
    });
  });
