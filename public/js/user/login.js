define(['jquery', 'sso-ux'],
  function($) {
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
});
