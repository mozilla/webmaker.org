define(['jquery', '/bower/webmaker-ui/ui.js', 'sso-ux'],
  function($, WebmakerUI) {
  "use strict";
  navigator.idSSO.app.onlogin = function(user) {
    if( document.referrer.indexOf( 'events' ) !== -1 ){
      window.location = "/events";
    }
    else {
      window.location = "/";
    }
  };
  navigator.idSSO.app.onnewuser = function(){
    window.location = "/new";
  };

  var langSelector = document.querySelector("#lang-picker");
  // URL redirector for language picker
  WebmakerUI.langPicker(langSelector);
});
