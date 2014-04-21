define(['jquery', 'eventEmitter/EventEmitter', 'base/login'],
  function ($, EventEmitter, auth) {
    'use strict';

    var emitter = new EventEmitter();

    var $applyBtn = $('#apply-now');
    var $closeBtn = $('#close-panel');
    var $applicationForm = $('#submit-badge-application');
    var $application = $('#application');
    var $error = $('#submit-badge-error');
    var $success = $('#submit-badge-success');
    var $loginOnly = $('.login-only');
    var $logoutOnly = $('.logout-only');
    var $applicationOn = $('.application-on');
    var $applicationOff = $('.application-off');

    // An application was submitted successfully
    emitter.on('submit-application', function () {
      $success.removeClass('hidden');
      $error.addClass('hidden');
      $application.addClass('hidden');
    });

    // An application error occurred
    emitter.on('submit-application-error', function (err) {
      $success.addlass('hidden');
      $error.removeClass('hidden');
    });

    emitter.on('reset-application', function (err) {
      $success.addClass('hidden');
      $error.addClass('hidden');
      $application.removeClass('hidden');
    });

    emitter.on('application-on', function () {
      $applicationOn.removeClass('hidden');
      $applicationOff.addClass('hidden');
    });

    emitter.on('application-off', function () {
      $applicationOn.addClass('hidden');
      $applicationOff.removeClass('hidden');
    });

    auth.on('login', function () {
      $loginOnly.removeClass('hidden');
      $logoutOnly.addClass('hidden');
    });

    auth.on('logout', function () {
      $loginOnly.addClass('hidden');
      $logoutOnly.removeClass('hidden');
    });

    $applicationForm.on('submit', function (e) {
      e.preventDefault();
      $.post('/badges/webmaker-super-mentor/apply', {
        evidence: $applicationForm.find('[name="evidence"]').val(),
        _csrf: $('meta[name="csrf-token"]').attr("content")
      })
        .done(function (data) {
          emitter.emitEvent('submit-application');
        })
        .fail(function (err) {
          emitter.emitEvent('submit-application-error', [err]);
        });
    });

    $applyBtn.on('click', function (e) {
      e.preventDefault();
      emitter.emitEvent('application-on');
    });
    $closeBtn.on('click', function (e) {
      e.preventDefault();
      emitter.emitEvent('application-off');
    });

    auth.verify();

  });
