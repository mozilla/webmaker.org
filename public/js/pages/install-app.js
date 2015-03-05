requirejs.config({
  baseDir: '/js',
  paths: {
    'analytics': '/bower_components/webmaker-analytics/analytics',
    'jquery': '/bower_components/jquery/jquery.min',
    'intl-tel-input': '/bower_components/intl-tel-input/build/js/intlTelInput.min',
    'ua-parser-js': '/bower_components/ua-parser-js/dist/ua-parser.min'
  }
});

require(['jquery', 'analytics', 'intl-tel-input', 'ua-parser-js'], function ($, analytics, UA) {
  'use strict';
  var downloadButtons = $('.download-app-btn'),
    getAppBtn = $('#get-app'),
    phoneNumberInput = $('.phone-num-input'),
    phoneNumberInputError = $('.phone-error'),
    sendSmsButton = $('.send-sms-btn'),
    messageSent = $('#message-sent'),
    messageSentError = $('.message-sent-error-container'),
    csrfToken = $('meta[name=\'csrf-token\']').attr('content'),
    smsForm = $('#sms-form'),
    initialVewportHeight = window.document.documentElement.clientHeight,
    getAppContainer = $('.get-app-container');

  var parser = new window.UAParser();
  var ua = parser.getResult();

  function isValidFFOS() {
    return ua.os.name === 'Firefox OS' && parseInt(ua.browser.major, 10) >= 32;
  }

  function isValidAndroid() {
    if (ua.os.name !== 'Android') {
      return false;
    }
    var version = ua.os.version && ua.os.version.split('.').map(function (n) {
      return parseInt(n, 10);
    });
    if (!version) {
      return true;
    }

    if (version[0] < 4) {
      return false;
    }
    if (version[0] === 4 && version[1] < 4) {
      return false;
    }

    return true;
  }

  if (isValidFFOS() || isValidAndroid()) {
    $('.mobile-only').removeClass('mobile-only');
  } else {
    $('.desktop-only').removeClass('desktop-only');
  }

  $(window).scroll(function checkScroll() {
    if (window.scrollY >= initialVewportHeight) {
      $(window).off('scroll', checkScroll);
      analytics.event('Scrolled Past Initial Viewport Height');
    }
  });

  function sendSMS() {
    sendSmsButton.attr('disabled', true);
    var phoneNumber = phoneNumberInput.intlTelInput('getNumber', window.intlTelInputUtils.numberFormat.INTERNATIONAL);

    analytics.event('Click Send SMS Link for Beta App', {
      label: phoneNumberInput.intlTelInput('getSelectedCountryData').iso2
    });

    $.ajax({
      type: 'POST',
      url: '/app/send-download-link',
      dataType: 'json',
      data: {
        to: phoneNumber
      },
      headers: {
        'X-CSRF-Token': csrfToken
      },
      error: function () {
        smsForm.addClass('hidden');
        messageSentError.removeClass('hidden');
      },
      success: function () {
        getAppContainer.addClass('hidden');
        messageSent.removeClass('hidden');
        analytics.event('SMS Send Success', {
          nonInteraction: true
        });
      }
    });
  }

  sendSmsButton.attr('disabled', true);

  downloadButtons.click(function () {
    analytics.event('Download Beta App');
  });

  getAppBtn.click(function () {
    analytics.event('Click Get App Button');
    smsForm.removeClass('hidden');
    getAppBtn.addClass('hidden');
  });

  phoneNumberInput.intlTelInput({
    defaultCountry: 'ES'
  });

  phoneNumberInput.intlTelInput('loadUtils', '/bower_components/intl-tel-input/lib/libphonenumber/build/utils.js');

  phoneNumberInput.keyup(function () {
    sendSmsButton.attr('disabled', !phoneNumberInput.intlTelInput('isValidNumber'));
  });

  phoneNumberInput.change(function () {
    sendSmsButton.attr('disabled', !phoneNumberInput.intlTelInput('isValidNumber'));
  });

  phoneNumberInput.focus(function () {
    phoneNumberInput.removeClass('invalid');
    phoneNumberInputError.addClass('hidden');
  });

  phoneNumberInput.blur(function () {
    if (phoneNumberInput.intlTelInput('isValidNumber')) {
      phoneNumberInput.removeClass('invalid');
      phoneNumberInputError.addClass('hidden');
    } else if (phoneNumberInput.val().trim().length > 0) {
      phoneNumberInput.addClass('invalid');
      phoneNumberInputError.removeClass('hidden');
    }
  });

  sendSmsButton.click(sendSMS);

  sendSmsButton.keypress(function (evt) {
    if (evt.keycode === 13 && phoneNumberInput.intlTelInput('isValidNumber')) {
      sendSMS();
    }
  });
});
