define(['jquery', 'cookie-js/cookie'], function ($, cookiejs) {
  'use strict';

  // Campaign

  return function (options) {

    var cookieOpts = {
      expires: new Date((Date.now() + 60 * 1000 * 60 * 4)) // four hours
    };

    var forceCampaignString = 'forceCampaignBanner';
    var slideSpeed = 100;

    var $campaignHeader = $(options.element);
    var cookieName = options.campaignName + '-closed';

    var isCampaignClosed = cookiejs.parse(document.cookie)[cookieName];
    var isForced = window.location.search.match(forceCampaignString);

    if (!isCampaignClosed || isForced) {
      $campaignHeader.slideDown(slideSpeed);
    }

    $campaignHeader.find('.campaign-close-button').on('click', function () {
      $campaignHeader.slideUp(slideSpeed);
      document.cookie = cookiejs.serialize(cookieName, true, cookieOpts);
    });
  };
});
