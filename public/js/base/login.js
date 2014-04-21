define(['jquery', 'webmaker-auth-client', 'analytics'], function ($, WebmakerAuthClient, analytics) {
  'use strict';

  var auth = new WebmakerAuthClient({
    csrfToken: $('meta[name="csrf-token"]').attr('content')
  });

  var loginEl = $('.webmaker-login');
  var logoutEl = $('.webmaker-logout');

  function toggleUserData(userData) {
    var placeHolder = $('#identity');
    var userElement = $('div.user-name');
    var emailSpans = $('.webmaker-email-placeholder')

    if (userData) {
      emailSpans.html(userData.email);
      placeHolder.html('<img src="https://secure.gravatar.com/avatar/' +
        userData.emailHash + '?s=26&d=https%3A%2F%2Fstuff.webmaker.org%2Favatars%2Fwebmaker-avatar-44x44.png" alt="">' +
        '<a href="' + $("#loginURL").attr('href') + '">' + userData.username + "</a>");
    } else {
      emailSpans.html('');
      userElement.html('<span id="identity"></span>');
    }
  }

  function onLogin(user) {
    $('#webmaker-nav').addClass('loggedin');
    toggleUserData(user);
    loginEl.hide();
    logoutEl.show();
  }

  function onLogout() {
    $('#webmaker-nav').removeClass('loggedin');
    toggleUserData();
    loginEl.show();
    logoutEl.hide();
  }

  auth.on('login', onLogin);
  auth.on('logout', onLogout);

  auth.on('error', function (err) {
    window.console.log(err);
  });

  loginEl.click(auth.login);
  loginEl.click(function () {
    analytics.event('Webmaker Login Clicked');
  });
  logoutEl.click(function () {
    analytics.event('Webmaker Logout Clicked');
  });
  auth.on('newuser', function () {
    analytics.event('Webmaker New User Started');
  });
  auth.on('login', function (data, message) {
    if (message === 'user created') {
      analytics.event('Webmaker New User Created', {
        nonInteraction: true
      });
    }
  });
  logoutEl.click(auth.logout);

  return auth;
});
