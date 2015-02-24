requirejs.config({
  baseDir: "/js",
  paths: {
    "analytics": "/bower_components/webmaker-analytics/analytics",
    "jquery": "/bower_components/jquery/jquery.min",
    "intl-tel-input": "/bower_components/intl-tel-input/build/js/intlTelInput.min"
  }
});

require(["jquery", "analytics", "intl-tel-input"], function ($, analytics) {
  "use strict";
  var downloadButtons = $(".download-app-btn"),
    sendInstallAppButtonContainer = $(".desktop-install-app-btn-wrapper"),
    sendInstallLinkContainer = $(".send-install-link-container"),
    smsPrivacyMessageContainer = $(".sms-privacy-message"),
    phoneNumberLabel = $(".phone-number-label"),
    getAppBtn = $(".desktop-install-app-btn"),
    phoneNumberInput = $(".phone-num-input"),
    sendSmsButton = $(".send-sms-btn"),
    messageSent = $(".message-sent-container"),
    messageSentError = $(".message-sent-error-container"),
    csrfToken = $("meta[name='csrf-token']").attr("content");

  function sendSMS() {
    sendSmsButton.attr("disabled", true);
    analytics.event("Send SMS Link for Beta App");
    var phoneNumber = phoneNumberInput.intlTelInput("getNumber", window.intlTelInputUtils.numberFormat.INTERNATIONAL);
    $.ajax({
      type: "POST",
      url: "/app/send-download-link",
      dataType: "json",
      data: {
        to: phoneNumber
      },
      headers: {
        "X-CSRF-Token": csrfToken
      },
      error: function () {
        phoneNumberLabel.addClass("hidden");
        phoneNumberInput.addClass("hidden");
        sendSmsButton.addClass("hidden");
        $(".intl-tel-input").addClass("hidden");
        messageSentError.removeClass("hidden");
      },
      success: function () {
        phoneNumberLabel.addClass("hidden");
        phoneNumberInput.addClass("hidden");
        sendSmsButton.addClass("hidden");
        $(".intl-tel-input").addClass("hidden");
        messageSent.removeClass("hidden");
      }
    });
  }

  sendSmsButton.attr("disabled", true);

  downloadButtons.click(function () {
    analytics.event("Download Beta App");
    window.open("http://mzl.la/installwm", "_blank");
  });

  getAppBtn.click(function () {
    analytics.event("Click Get App Button");
    sendInstallAppButtonContainer.addClass("hidden");
    sendInstallLinkContainer.removeClass("hidden");
    smsPrivacyMessageContainer.removeClass("hidden");
  });

  phoneNumberInput.intlTelInput();

  phoneNumberInput.intlTelInput("loadUtils", "/bower_components/intl-tel-input/lib/libphonenumber/build/utils.js");

  phoneNumberInput.keyup(function () {
    sendSmsButton.attr("disabled", !phoneNumberInput.intlTelInput("isValidNumber"));
  });

  sendSmsButton.click(sendSMS);

  sendSmsButton.keypress(function (evt) {
    if (evt.keycode === 13 && phoneNumberInput.intlTelInput("isValidNumber")) {
      sendSMS();
    }
  });
});
