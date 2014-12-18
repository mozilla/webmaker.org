define(['jquery', 'uri', 'base/ui', 'localized', 'masonry', 'base/login'],
  function ($, URI, UI, localized, Masonry, webmakerAuth) {
    'use strict';

    localized.ready(function () {
      var $makes = $(".make"),
        $deleteBtn = $(".delete-btn"),
        mainGallery = $(".main-gallery")[0],
        totalHits,
        LIMIT,
        queryKeys = URI.parse(window.location.href).queryKey,
        masonry,
        page;

      function reload() {
        window.location.replace(window.location);
      }

      if (!$("meta[name='persona-email']").attr("content")) {
        webmakerAuth.on('login', reload);
      } else {
        webmakerAuth.on('logout', reload);
      }

      // Do we have any makes?
      if (!$makes.length) {
        return;
      }

      masonry = new Masonry(mainGallery, {
        itemSelector: 'div.make',
        gutter: '.gutter-sizer',
        transitionDuration: '0.2'
      });

      // Set up the delete buttons
      $deleteBtn.on("click", function (e) {
        e.preventDefault();
        var $this = $(this),
          makeID = $this.data("make-id");
        if (window.confirm(localized.get("Are you sure you want to delete this make?"))) {
          $.post("/remove", {
            makeID: makeID,
            _csrf: $("meta[name='csrf-token']").attr("content")
          }, function (res) {
            if (res.deletedAt) {
              masonry.remove($this.closest(".make")[0]);
              masonry.layout();
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
