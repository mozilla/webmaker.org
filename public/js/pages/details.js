requirejs.config({
  baseUrl: '/js',
  paths: {
    'jquery': '../bower/jquery/jquery',
    'social': '../js/lib/socialmedia',
    'localized': '../bower/webmaker-i18n/localized'
  }
});
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
        $likeNotLoggedInMsg = $("#like-not-logged-in"),
        $reportButton = $("#make-report-toggle"),
        $reportedText = $("#make-reported-text"),
        $reportNotLoggedInMsg = $("#report-not-logged-in"),
        $reportError = $("#make-report-error"),
        $makeReportedMsg = $("#make-reported-message"),
        googleBtn = document.getElementById("google-btn"),
        twitterBtn = document.getElementById("twitter-btn"),
        fbBtn = document.getElementById("fb-btn"),
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

      function displayTooltip($tooltipElem, delay) {
        var timer;

        function hideTooltip(e) {
          window.removeEventListener("click", clickCallback, false);
          window.clearTimeout(timer);
          $tooltipElem.addClass("hide");
        }

        function clickCallback(e) {
          if (e.target === $tooltipElem.find("a")[0]) {
            return true;
          }
          hideTooltip();
        }

        $tooltipElem.removeClass("hide");
        timer = window.setTimeout(hideTooltip, delay);
        window.addEventListener("click", clickCallback, false);
      }

      $likeNotLoggedInMsg.on("click", openLogInWindow);
      $reportNotLoggedInMsg.on("click", openLogInWindow);

      $shareBtn.on("click", shareOnClick);
      $shareBtn.on("click", shareOnClick);

      $likeBtn.on("click", function (e) {
        if (e.target !== $likeBtn[0]) {
          return;
        }

        e.preventDefault();

        var makeID = $likeBtn.data("make-id"),
          method;

        if ($likeBtn.hasClass("icon-heart")) {
          method = "/unlike";
        } else {
          method = "/like";
        }

        $.post(method, {
          makeID: makeID,
          _csrf: $("meta[name='csrf-token']").attr("content")
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
          if (res.status === 401) {
            displayTooltip($likeNotLoggedInMsg, 5000);
          }
        });
      });

      $reportButton.on("click", function (e) {
        if (e.target !== $reportButton[0]) {
          return;
        }

        e.preventDefault();

        var makeID = $reportButton.data("make-id"),
          method;

        if ($reportButton.hasClass("icon-flag")) {
          method = "/cancelReport";
        } else {
          method = "/report";
        }

        $.post(method, {
          makeID: makeID,
          _csrf: $("meta[name='csrf-token']").attr("content")
        }, function (res) {
          $reportButton.toggleClass("icon-flag icon-flag-alt");
          $reportedText.toggleClass("hide");
          if (method === "/report") {
            displayTooltip($makeReportedMsg, 10000);
          }
        }).fail(function (res) {
          if (res.status === 401) {
            displayTooltip($reportNotLoggedInMsg, 5000);
          } else {
            displayTooltip($reportError, 5000);
          }
        });
      });
    });
  });
