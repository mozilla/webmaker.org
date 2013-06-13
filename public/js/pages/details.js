define(['jquery', 'social'],
  function ($, SocialMedia) {
  'use strict';
  var social,
      $body = $("body"),
      $shareBtn = $( "#share-btn" ),
      $shareContainer = $( "#share-container" ),
      googleBtn = document.getElementById( "google-btn" ),
      twitterBtn = document.getElementById( "twitter-btn" ),
      fbBtn = document.getElementById( "fb-btn" ),
      tool = $body.data("tool"),
      url = $body.data("url");

    social = new SocialMedia({
      message: "Tweet this awesome "+ tool +" project: ",
      via: "#webmaker"
    });

    function shareOnClick() {
      social.hotLoad( twitterBtn, social.twitter, url );
      social.hotLoad( googleBtn, social.google, url );
      social.hotLoad( fbBtn, social.facebook, url );
      $shareBtn.addClass( "hidden" );
      $shareContainer.removeClass( "hidden" );
      $shareBtn.off( "click", shareOnClick );
    }

    $shareBtn.on( "click", shareOnClick );

});
