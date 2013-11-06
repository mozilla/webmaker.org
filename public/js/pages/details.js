define(['jquery', 'social', 'localized'],
  function ($, SocialMedia, localized) {
    localized.ready(function () {
      var social,
        $body = $("body"),
        $shareBtn = $("#share-btn"),
        $shareContainer = $("#share-container"),
        $likeBtn = $(".make-like-toggle"),
        $likeCount = $(".like-count"),
        $likeText = $(".like-text"),
        $notLoggedInMsg = $(".not-logged-in"),
        googleBtn = document.getElementById("google-btn"),
        twitterBtn = document.getElementById("twitter-btn"),
        fbBtn = document.getElementById("fb-btn"),
        tool = $body.data("tool"),
        url = $body.data("url");

      var socialMessage = localized.get('DetailsShareTwitterMsg');
      social = new SocialMedia({
        message: socialMessage,
        via: "webmaker"
      });

      function shareOnClick() {
        social.hotLoad(twitterBtn, social.twitter, url);
        social.hotLoad(googleBtn, social.google, url);
        social.hotLoad(fbBtn, social.facebook, url);
        $shareBtn.addClass("hidden");
        $shareContainer.removeClass("hidden");
        $shareBtn.off("click", shareOnClick);
      }

      function openLogInWindow() {
        window.open("/login", "Log In");
      }

      $shareBtn.on("click", shareOnClick);

      $notLoggedInMsg.on("click", openLogInWindow);

      $likeBtn.on("click", function (e) {
        if (e.target !== $likeBtn[0]) {
          return;
        }

        e.preventDefault();

        var makeID = $likeBtn.data("make-id"),
          count,
          method;

        if ($likeBtn.hasClass("icon-heart")) {
          method = "/unlike";
        } else {
          method = "/like";
        }

        $.post(method, {
          makeID: makeID,
          _csrf: $("meta[name='X-CSRF-Token']").attr("content")
        }, function (res) {
          var newLen = res.likes.length;
          $likeBtn.toggleClass("icon-heart icon-heart-empty");
          $likeCount.html(newLen);
          if (newLen === 0) {
            $likeText.html(localized.get("Like-0"));
          } else if (newLen === 1) {
            $likeText.html(localized.get("Like-1"));
          } else {
            $likeText.html(localized.get("Like-n"));
          }
        }).fail(function (res) {
          var timer;

          function removeLogInMsg(e) {
            window.removeEventListener("click", removeLogInMsg, false);
            window.clearTimeout(timer);
            $notLoggedInMsg.addClass("hide");
          }

          if (res.status === 401) {
            $notLoggedInMsg.removeClass("hide");
            timer = window.setTimeout(removeLogInMsg, 5000);
            window.addEventListener("click", function (e) {
              if (e.target === $notLoggedInMsg.find("a")[0]) {
                return true;
              }
              removeLogInMsg();
            }, false);
          }
        });
      });
    });
  });
//blue
