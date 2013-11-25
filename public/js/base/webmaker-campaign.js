define(['jquery', 'cookie'], function ($, cookie) {
  'use strict';

  // Campaign

  return function (options) {

    cookie.expiresMultiplier = 60 * 60; // In hours

    var forceCampaignString = 'forceCampaignBanner';
    var slideSpeed = 100;

    var $campaignHeader = $(options.element);
    var cookieName = options.campaignName + '-closed';

    var isCampaignClosed = cookie.get(cookieName);
    var isForced = window.location.search.match(forceCampaignString);

    if (!isCampaignClosed || isForced) {
      $campaignHeader.slideDown(slideSpeed);
    }

    $campaignHeader.find('.campaign-close-button').on('click', function () {
      $campaignHeader.slideUp(slideSpeed);
      cookie.set(cookieName, true, {
        expires: 4
      });
    });

  };

});
