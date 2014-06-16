define(['jquery', 'webmaker-auth-client'], function ($, WebmakerAuthClient) {
  'use strict';

  var auth = new WebmakerAuthClient({
    csrfToken: $('meta[name="csrf-token"]').attr('content')
  });

  var loginEl = $('.webmaker-login');
  var logoutEl = $('.webmaker-logout');

  function toggleUserData(userData) {
    var placeHolder = $('#identity');
    var userElement = $('div.user-name');
    var emailSpans = $('.webmaker-email-placeholder');
    var profileLink = $('.profile-link a');

    function userBadge(user) {
      if (user.isAdmin) {
        return ' <span class="label label-primary">admin</span>';
      } else if (user.isSuperMentor) {
        return ' <span class="label label-info">supermentor</span>';
      } else if (user.isMentor) {
        return ' <span class="label label-warning">mentor</span>';
      } else {
        return '';
      }
    }

    if (userData) {
      emailSpans.html(userData.email);
      placeHolder.html('<img src="' + userData.avatar + '" alt="">' +
        '<a href="' + $("#loginURL").attr('href') + '">' + userData.username + userBadge(userData) + "</a>");
      profileLink.attr('href', '/user/' + userData.username);
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
  logoutEl.click(auth.logout);

  return auth;
});
