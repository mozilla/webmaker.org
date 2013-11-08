define(['jquery', '/bower/webmaker-ui/ui.js', 'sso-ux'],
  function ($, WebmakerUI) {
    "use strict";
    var lang = $('html').attr('lang');

    navigator.idSSO.app.onlogin = function (user) {
      var rdomain = document.referrer.split("\/")[2];
      if (rdomain === "webmaker.org" || rdomain === "makes.org") {
        window.location.replace(document.referrer);
      } else {
        window.location = "/" + lang;
      }
    };
    navigator.idSSO.app.onnewuser = function () {
      window.location = "/" + lang + "/new";
    };

    var langSelector = document.querySelector("#lang-picker");
    // URL redirector for language picker
    WebmakerUI.langPicker(langSelector);
  });
