define(['jquery', 'base/ui', 'sso-ux'],
  function($, UI) {
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
  // URL redirector for language picker
  UI.langPicker('#lang-picker');
});
