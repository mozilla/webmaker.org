define(['jquery', 'eventEmitter/EventEmitter', 'base/login'],
  function ($, EventEmitter, auth) {
    'use strict';

    var emitter = new EventEmitter();

    var $applyBtn = $('#apply-now');
    var $closeBtn = $('.js-close-panel');
    var $issueBadgeBtn = $('#js-badge-issuing');
    var $applicationForm = $('#submit-badge-application');
    var $application = $('#application');
    var $claimCodeInput = $applicationForm.find('[name="claimcode"]');
    var $evidenceInput = $applicationForm.find('[name="evidence"]');
    var $cityInput = $applicationForm.find('[name="city"]');
    var $applicationInputs = $evidenceInput.add($cityInput);
    var $error = $('.submit-badge-error');
    var $success = $('#submit-badge-success');
    var $successIssued = $('#issue-badge-success');
    var $successClaimed = $('#claim-badge-success');
    var $loginOnly = $('.login-only');
    var $logoutOnly = $('.logout-only');
    var $applicationOn = $('.application-on');
    var $applicationOff = $('.application-off');
    var $issueBadgeOn = $('.js-issue-badge-on');
    var $issue = $('#issue');
    var $issueForm = $('#issue-form');
    var $claimCodeQuestion = $('#claim-code-explainer');

    var badgeSlug = $application.attr('data-badge-slug');
    var applicationSlug = $application.attr('data-application-slug');

    // An application was submitted successfully
    emitter.on('submit-application', function () {
      $success.removeClass('hidden');
      $error.addClass('hidden');
      $application.addClass('hidden');
    });

    // An claim code was claimed successfully
    emitter.on('claim-successful', function () {
      $successClaimed.removeClass('hidden');
      $error.addClass('hidden');
      $application.addClass('hidden');
    });

    // An application was submitted successfully
    emitter.on('badge-issued', function () {
      $successIssued.removeClass('hidden');
      $error.addClass('hidden');
      $issue.addClass('hidden');
    });

    // An application error occurred
    emitter.on('error', function (err) {
      if (err.responseJSON) {
        $error.find('.error-message').html('(' + err.responseJSON.error + ')');
      }
      $success.addClass('hidden');
      $successIssued.addClass('hidden');
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

    emitter.on('js-issue-badge-on', function () {
      $issueBadgeOn.removeClass('hidden');
      $applicationOff.addClass('hidden');
    });

    emitter.on('application-off', function () {
      $applicationOn.addClass('hidden');
      $issueBadgeOn.addClass('hidden');
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

    $claimCodeInput.on('change', function (e) {
      if ($claimCodeInput.val().length) {
        $applicationInputs.removeAttr('required');
        $applicationInputs.attr('disabled', 'disabled');
      } else {
        $applicationInputs.attr('required', 'required');
        $applicationInputs.removeAttr('disabled');
      }
    }).change();

    $claimCodeQuestion.powerTip({
      placement: 'ne'
    });

    $applicationForm.on('submit', function (e) {
      e.preventDefault();

      var claimcode = $claimCodeInput.val();
      if (claimcode.length) {
        $.post('/api/badges/' + badgeSlug + '/claim', {
          claimcode: claimcode,
          _csrf: $('meta[name="csrf-token"]').attr('content')
        })
          .done(function (data) {
            emitter.emitEvent('claim-successful');
          })
          .fail(function (err) {
            emitter.emitEvent('error', [err]);
          });
      } else {
        $.post('/api/badges/' + badgeSlug + '/apply', {
          evidence: $evidenceInput.val(),
          city: $cityInput.val(),
          applicationSlug: applicationSlug,
          _csrf: $('meta[name="csrf-token"]').attr('content')
        })
          .done(function (data) {
            emitter.emitEvent('submit-application');
          })
          .fail(function (err) {
            emitter.emitEvent('error', [err]);
          });
      }
    });

    $issueForm.on('submit', function (e) {
      e.preventDefault();
      $.post('/api/badges/' + badgeSlug + '/issue', {
        email: $issueForm.find('[name="email"]').val(),
        comment: $issueForm.find('[name="comment""]').val(),
        _csrf: $('meta[name="csrf-token"]').attr('content')
      })
        .done(function (data) {
          emitter.emitEvent('badge-issued');
        })
        .fail(function (err) {
          emitter.emitEvent('error', [err]);
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
    $issueBadgeBtn.on('click', function (e) {
      e.preventDefault();
      emitter.emitEvent('js-issue-badge-on');
    });

  });
