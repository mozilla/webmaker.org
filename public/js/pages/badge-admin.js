define(['jquery', 'base/login'],
  function ($, auth) {
    'use strict';

    var slug = $('#badges-admin-container').attr('data-slug');

    var revokeBtn = $('.revoke-badge');
    var issueEmail = $('[name="issue_email"]');
    var issueBtn = $('.issue-btn');
    var tableAdmin = $('.table-admin');

    function errorHandler(err) {
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      $('.error-message').text(err.responseText);
      $('.error').removeClass('hidden');
    }

    // Issuing
    issueBtn.on('click', function (e) {
      var email = issueEmail.val();
      $.post('/badges/' + slug + '/issue', {
        email: email,
        _csrf: $('meta[name="csrf-token"]').attr('content')
      })
        .done(function (result) {
          var firstTr = tableAdmin.find('tr[data-email]:first');
          var tr = firstTr.clone();

          tr.find('[data-email]').attr('data-email', email);
          tr.find('td:first-of-type').text(email);
          tr.insertBefore(firstTr);

          $('.error').addClass('hidden');
          issueEmail.val('');
        })
        .fail(errorHandler);
    });

    // Revoking
    revokeBtn.on('click', function (e) {
      e.preventDefault();

      var email = $(this).attr('data-email');
      var sure = window.confirm('Are you sure you want to delete the badge for ' + email + '?');
      if (sure) {
        $.ajax({
          url: '/badges/' + slug + '/instance/email/' + email,
          data: {
            _csrf: $('meta[name="csrf-token"]').attr('content')
          },
          type: 'DELETE',
          success: function (result) {
            $('.error').addClass('hidden');
            if (result === 'DELETED') {
              $('tr[data-email="' + email + '"]').remove();
            }
          },
          error: errorHandler
        });
      }

    });

    auth.verify();

  });
