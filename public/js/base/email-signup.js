define(['jquery', 'jquery.powertip'], function ($) {
  // Element references -------------------------------------------------------

  var $input = $('#email-updates');
  var $submit = $('#email-submit');
  var $checkbox = $('#newsletter-signup-checkbox').prop('checked', false);
  var $form = $('#privacy-form');

  // Properties ---------------------------------------------------------------

  var tipVisible = false;
  var privacyPolicyChecked = false;

  // Setup --------------------------------------------------------------------

  // Instantiate "powerTip" plugin
  $input.powerTip({
    smartPlacement: true,
    placement: 's',
    manual: true,
    fadeOutTime: 400
  });

  // Cache a reference to the tooltip
  var $powertip = $('#powerTip');

  // Event Delegation ---------------------------------------------------------

  $input.on('keyup', function () {
    if (!tipVisible && !privacyPolicyChecked) {
      showTip();
    }
  });

  // Handle tab key on text input
  $input.on('keydown', function (event) {
    if (event.keyCode === 9) {
      event.preventDefault();
      if (privacyPolicyChecked) {
        $submit.focus();
      } else {
        $powertip.find('input').focus();
      }
    }
  });

  $submit.on('click', function (event) {
    event.preventDefault();
    submitForm();
  });

  $powertip.on('click', 'input', function () {
    $(this).removeClass('invalid');
    hideTip();

    privacyPolicyChecked = true;

    // Act as a proxy to the "real" form checkbox
    $checkbox.prop('checked', true);

    $submit.focus();
  });

  // Functions ----------------------------------------------------------------

  function validateEmail(email) {
    // jscs:disable maximumLineLength
    var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // jscs:enable maximumLineLength
    return emailRegex.test(email);
  }

  function showTip() {
    $.powerTip.show($input);
    tipVisible = true;
  }

  function hideTip() {
    $.powerTip.hide($input);
    tipVisible = false;
  }

  function submitForm() {
    var isValid = true;

    // Perform validations

    if (validateEmail($input.val())) {
      $input.removeClass('invalid');
    } else {
      isValid = false;
      $input.addClass('invalid');
    }

    if ($checkbox.prop('checked')) {
      $powertip.find('input').removeClass('invalid');
    } else {
      isValid = false;
      $powertip.find('input').addClass('invalid');
    }

    if (isValid) {
      $form.submit();
    }
  }

  // Public API ---------------------------------------------------------------

  return {
    showTip: showTip,
    hideTip: hideTip
  };
});
