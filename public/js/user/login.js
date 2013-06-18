define(['jquery', 'sso-ux'],
  function($) {
  "use strict";
  navigator.idSSO.app.onlogin = function(user) {
    window.location = "/";
  };
  navigator.idSSO.app.onnewuser = function(){
    window.location = "/new";
  };
});
