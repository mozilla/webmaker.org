define(['jquery', 'sso-ux'],
  function ($) {
    "use strict";
    var $formFrag = $("#sso_create");
    var $mailSignUp = $('#bsd');
    var $usernameInput = $("#claim-input");
    var $errorContainer = $("#error-container");
    var csrf = $("meta[name='csrf-token']").attr("content");
    var email = $("meta[name='persona-email']").attr("content");

    // custom relation, see http://wiki.whatwg.org/wiki/RelExtensions
    var loginURL = $("link[rel='login']").attr("content");

    // Redirect if the user has an account;
    navigator.idSSO.app.onlogin = function () {
      window.location = "/";
    };

    // Prevent default dropdown
    navigator.idSSO.app.onnewuser = function () {};

    $formFrag.submit(function () {
      if ($mailSignUp.is(':checked')) {
        $.ajax({
          type: 'POST',
          url: 'https://sendto.mozilla.org/page/s/webmaker',
          data: {
            email: $usernameInput.val(),
            'custom-1216': 1
          },
          success: function () {
            return true;
          },
          error: function () {
            return false;
          }
        });
      }

      $.ajax({
        type: "POST",
        url: loginURL + "/user",
        headers: {
          "X-CSRF-Token": csrf // express.js uses a non-standard name for csrf-token
        },
        dataType: "json",
        data: {
          "_id": email,
          "email": email,
          "username": $usernameInput.val()
        },
        success: function () {
          window.location = "/";
        },
        error: function (resp) {
          var error = JSON.parse(resp.responseText);
          if (error.error.code === 11000) {
            $errorContainer.text("Sorry, the username " + $usernameInput.val() + " is taken!");
            $usernameInput.val("");
          }
          return false;
        }
      });
      return false;
    });
  });
