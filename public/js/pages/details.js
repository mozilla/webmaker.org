/* globals WebmakerLogin */

requirejs.config({
  baseUrl: '/js',
  paths: {
    'jquery': '../bower_components/jquery/jquery',
    'social': '../js/lib/socialmedia',
    'localized': '../bower_components/webmaker-i18n/localized'
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
        url = $body.data("url"),
        csrfToken = $("meta[name='csrf-token']").attr("content"),
        webmakerAuth = new WebmakerLogin({
          csrfToken: $('meta[name="csrf-token"]').attr('content')
        });

      webmakerAuth.on('verified', function (user) {
        if (user) {
          webmakerAuth.emit('login', user);
        } else {
          webmakerAuth.emit('logout');
        }
      });

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

      $shareBtn.on("click", shareOnClick);

      function openLogInWindow(actionCallback) {
        function onLogin() {
          webmakerAuth.off("login", onLogin);
          webmakerAuth.off("error", onError);
          actionCallback();
        }

        function onError() {
          webmakerAuth.off("login", onLogin);
          webmakerAuth.off("error", onError);
        }
        webmakerAuth.on("login", onLogin);
        webmakerAuth.on("error", onError);
        webmakerAuth.login();
      }

      function displayTooltip($tooltipElem, delay) {
        var timer;

        function hideTooltip(e) {
          window.removeEventListener("click", clickCallback);
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
        window.addEventListener("click", clickCallback);
      }

      // Like event handlers

      function likeRequest() {
        var makeID = $likeBtn.data("make-id"),
          method;

        if ($likeBtn.hasClass("icon-heart")) {
          method = "/unlike";
        } else {
          method = "/like";
        }

        $.post(method, {
          makeID: makeID,
          _csrf: csrfToken
        }, function (res) {
          updateLikes(res.likes.length);

        }).fail(function (res) {
          if (res.status === 401) {
            displayTooltip($likeNotLoggedInMsg, 5000);
          } else if (res.status === 400) {
            // user already likes/unliked
            updateLikes();
          }
        });
      }

      function updateLikes(newLen) {
        $likeBtn.toggleClass("icon-heart icon-heart-empty");
        if (typeof newLen === "undefined") {
          return;
        } else if (newLen === 0) {
          $likeText.html(localized.get("Like-0"));
        } else if (newLen === 1) {
          $likeText.html(localized.get("Like-1"));
        } else {
          $likeText.html(localized.get("Like-n"));
        }
        $likeCount.html(newLen);
      }

      $likeBtn.on("click", function (e) {
        if (e.target !== $likeBtn[0]) {
          return;
        }
        e.preventDefault();
        likeRequest();
      });

      $likeNotLoggedInMsg.on("click", function () {
        openLogInWindow(likeRequest);
      });

      // Report Event Handlers

      function reportRequest() {
        var makeID = $reportButton.data("make-id"),
          method;

        if ($reportButton.hasClass("icon-flag")) {
          method = "/cancelReport";
        } else {
          method = "/report";
        }

        $.post(method, {
          makeID: makeID,
          _csrf: csrfToken
        }, function (res) {
          updateReport(method);
        }).fail(function (res) {
          if (res.status === 401) {
            displayTooltip($reportNotLoggedInMsg, 5000);
          } else if (res.status === 400) {
            // already reported/cancelled
            updateReport(method);
          } else {
            displayTooltip($reportError, 5000);
          }
        });
      }

      function updateReport(method) {
        $reportButton.toggleClass("icon-flag icon-flag-alt");
        $reportedText.toggleClass("hide");
        if (method === "/report") {
          displayTooltip($makeReportedMsg, 10000);
        }
      }

      $reportButton.on("click", function (e) {
        if (e.target !== $reportButton[0]) {
          return;
        }
        e.preventDefault();
        reportRequest();
      });

      $reportNotLoggedInMsg.on("click", function () {
        openLogInWindow(reportRequest);
      });
    });
  });
