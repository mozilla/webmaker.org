define(['jquery', 'eventEmitter/EventEmitter', 'base/login'],
  function ($, EventEmitter, auth) {
    'use strict';

    var emitter = new EventEmitter();

    var $applyBtn = $('#apply-now');
    var $closeBtn = $('.js-close-panel');
    var $issueBadgeBtn = $('#js-badge-issuing');
    var $applicationForm = $('#submit-badge-application');
    var $application = $('#application');
    var $claimCodeButtonLogin = $('.claim-code-button-login');
    var $claimCodeButtonLogout = $('.claim-code-button-logout');
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
    var $claimCodContainer = $('.claim-code-container');
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
      $issueBadgeOn.addClass('hidden');
      $claimCodContainer.addClass('hidden');
      $applicationOn.removeClass('hidden');
      $applicationOff.addClass('hidden');
      $claimCodeButtonLogin.removeClass('hidden');
    });

    emitter.on('claim-code-button-click', function () {
      $applicationOn.addClass('hidden');
      $issueBadgeOn.addClass('hidden');
      $claimCodContainer.removeClass('hidden');
      $applicationOff.removeClass('hidden');
      $claimCodeButtonLogin.addClass('hidden');
    });

    emitter.on('js-issue-badge-on', function () {
      $applicationOn.addClass('hidden');
      $claimCodContainer.addClass('hidden');
      $issueBadgeOn.removeClass('hidden');
      $applicationOff.addClass('hidden');
      $claimCodeButtonLogin.removeClass('hidden');
    });

    emitter.on('application-off', function () {
      $applicationOn.addClass('hidden');
      $issueBadgeOn.addClass('hidden');
      $claimCodContainer.addClass('hidden');
      $applicationOff.removeClass('hidden');
      $claimCodeButtonLogin.removeClass('hidden');
    });

    $logoutOnly.on('click', function () {
      auth.login();
    });

    var fireClaimCode = false;
    $claimCodeButtonLogout.on('click', function (e) {
      e.preventDefault();
      fireClaimCode = true;
      auth.login();
    });
    auth.on('login', function (user) {
      $claimCodeButtonLogin.removeClass('hidden');
      $claimCodeButtonLogout.addClass('hidden');
      $('.webmaker-email-placeholder').text(user.email);

      if (fireClaimCode) {
        fireClaimCode = false;
        emitter.emitEvent('claim-code-button-click');
      }

      $loginOnly.removeClass('hidden');
      $logoutOnly.addClass('hidden');
    });
    auth.on('logout', function () {
      $claimCodeButtonLogin.addClass('hidden');
      $claimCodeButtonLogout.removeClass('hidden');
      $('.webmaker-email-placeholder').text('');

      $loginOnly.addClass('hidden');
      $logoutOnly.removeClass('hidden');
    });

    auth.wmLogin.verify();
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
    $claimCodeButtonLogin.on('click', function (e) {
      e.preventDefault();
      emitter.emitEvent('claim-code-button-click');
    });
    $issueBadgeBtn.on('click', function (e) {
      e.preventDefault();
      emitter.emitEvent('js-issue-badge-on');
    });
  });
