define(['jquery', 'webmaker-auth-client/webmaker-auth-client'], function ($, WebmakerAuthClient) {
  'use strict';

  var auth = new WebmakerAuthClient({
    csrfToken: $('meta[name="csrf-token"]').attr('content')
  });

  var loginEl = $('.webmaker-login');
  var logoutEl = $('.webmaker-logout');

  function toggleUserData(userData) {
    var placeHolder = $('#identity');
    var userElement = $('div.user-name');
    var lang = $('html').attr('lang') || 'en-US';

    if (userData) {
      placeHolder.html('<img src="https://secure.gravatar.com/avatar/' +
        userData.emailHash + '?s=26&d=https%3A%2F%2Fstuff.webmaker.org%2Favatars%2Fwebmaker-avatar-44x44.png" alt="' +
        userData.emailHash + '">' +
        '<a href="/' + lang + '/account">' + userData.username + "</a>");
    } else {
      userElement.html('<span id="identity"></span>');
    }
  }

  function onLogin(user) {
    auth.off('verified', onVerified);
    $('#webmaker-nav').addClass('loggedin');
    toggleUserData(user);
    loginEl.hide();
    logoutEl.show();
  }

  function onLogout() {
    auth.off('verified', onVerified);
    $('#webmaker-nav').removeClass('loggedin');
    toggleUserData();
    loginEl.show();
    logoutEl.hide();
  }

  function onVerified(user) {
    if (user) {
      onLogin(user);
    } else {
      onLogout();
    }
  }

  auth.on('login', onLogin);
  auth.on('logout', onLogout);
  auth.on('verified', onVerified);
  auth.on('error', function (err) {
    window.console.log(err);
  });

  loginEl.click(auth.login);
  logoutEl.click(auth.logout);

  return auth;
});
