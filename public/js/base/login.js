/* globals WebmakerLogin */

define(['jquery', 'url-template', 'selectize'], function ($, urlTemplate) {
  'use strict';

  var joinEl = $('#webmaker-nav .join-button');
  var loginEl = $('#webmaker-nav .signin-button');
  var logoutEl = $('#webmaker-nav .logout-button');
  var userInfoDropdown = $('#webmaker-nav .user-info-dropdown');
  var avatarEl = userInfoDropdown.find('img[data-avatar]');
  var usernameEl = userInfoDropdown.find('strong[data-username]');
  var adminEl = userInfoDropdown.find('span[data-admin]');
  var supermentorEl = userInfoDropdown.find('span[data-supermentor]');
  var mentorEl = userInfoDropdown.find('span[data-mentor]');
  var profileEl = userInfoDropdown.find('a[data-profile]');

  function enable(user) {
    joinEl.addClass('hidden');
    loginEl.addClass('hidden');

    avatarEl.attr('src', user.avatar);
    usernameEl.text(user.username);

    adminEl.addClass('hidden');
    supermentorEl.addClass('hidden');
    mentorEl.addClass('hidden');
    if (user.isAdmin) {
      adminEl.removeClass('hidden');
    } else if (user.isSuperMentor) {
      supermentorEl.removeClass('hidden');
    } else if (user.isMentor) {
      mentorEl.removeClass('hidden');
    }

    profileEl.attr('href', urlTemplate.parse(profileEl.attr('data-href-template')).expand(user));

    userInfoDropdown.removeClass('hidden');
  }

  function disable() {
    joinEl.removeClass('hidden');
    loginEl.removeClass('hidden');
    userInfoDropdown.addClass('hidden');
  }

  $('#webmaker-nav .dropdown').each(function (index, el) {
    var dropDownMenu = el.querySelector('.dropdown-menu');
    var dropDownToggle = el.querySelector('.dropdown-toggle');
    dropDownToggle.addEventListener('click', function (e) {
      e.preventDefault();
      if (dropDownMenu.style.display === 'block') {
        dropDownMenu.style.display = '';
      } else {
        dropDownMenu.style.display = 'block';
      }
    }, false);
  });

  var auth = new WebmakerLogin({
    csrfToken: $('meta[name="csrf-token"]').attr('content'),
    showCTA: true
  });

  joinEl.click(function () {
    auth.create();
  });
  loginEl.click(function () {
    auth.login();
  });
  logoutEl.click(function () {
    auth.logout();
  });

  auth.on('login', enable);
  auth.on('logout', disable);
  auth.on('verified', function (user) {
    if (user) {
      auth.emit('login', user);
    } else {
      auth.emit('logout');
    }
  });

  return auth;
});
