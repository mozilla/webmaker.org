define(['jquery'], function($) {
  'use strict';
  // variables & setup
  var $input = $('#email-updates');
  var $submit = $('#email-submit');
  var $privacy = $('.privacy-box');
  var $cheќkbox = $('#theCheckbox').prop('checked', false);
  var $form = $('#privacy-form');
  var $newsletter = $('.newsletter');
  var timeOut = false;

  function attach() {
    $input.on('focus', function(e) {
      $privacy.addClass('privacy-box-active');
    });

    $newsletter.on('mouseleave', function(e) {
      timeOut = setTimeout(function(e) {
        if(timeOut) $privacy.removeClass('privacy-box-active');
      }, 1000);
    });

    $newsletter.on('mouseenter', function(e) {
      clearTimeout(timeOut);
    });

    $privacy.on('mouseenter', function(e) {
      clearTimeout(timeOut);
    });

    $submit.on('click', function(e) {
      if( $input.val().length ) {
        return true;
      }
      else {
        return false;
      }
    });
  }

  var self = {
    attach: attach
  }

  return self;
});
