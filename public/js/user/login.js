define(['jquery', '/bower/webmaker-ui/ui.js', 'sso-ux'],
  function ($, WebmakerUI, localized) {
    "use strict";
    var lang = $('html').attr('lang');

    navigator.idSSO.app.onlogin = function (user) {
      if (document.referrer.indexOf('events') !== -1) {
        window.location = "/" + lang + "/events";
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
