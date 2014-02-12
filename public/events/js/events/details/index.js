define(['jquery', 'google', 'forms', 'localized', 'base/login', 'domReady!'],
function ($, google, forms, localized, webmakerAuth) {
  localized.ready(function(){});
    var $editForm = $('form#edit-event');

    $('#back-to-events a').click(function(e) {
      e.preventDefault();
      if (document.referrer) {
        window.location = document.referrer;
      }
      else {
        window.location = '/' + localized.getCurrentLang() + '/events/';
      }
    });

    $editForm.validate({
        rules: {
            registerLink: 'url'
        }
    });

    function toggleEditMode() {
        $('.show').toggleClass('hidden');
        $('.edit').toggleClass('hidden');
        location.hash = (location.hash == '#edit') ? '' : '#edit';
    }
    function enterEditMode() {
        $('.show').addClass('hidden');
        $('.edit').removeClass('hidden');
        location.hash = '#edit';
    }
    function leaveEditMode() {
        $('.show').removeClass('hidden');
        $('.edit').addClass('hidden');
        location.hash = '';
        $editForm[0].reset();
    }

    $editForm.find('button#edit-mode').click(enterEditMode);
    $editForm.find('button#cancel-edit').click(leaveEditMode);

    if (location.hash == '#edit')
        enterEditMode();

    var delete_safety = 1;
    $editForm.find('button#delete-event').click(function(ev) {
        var $deleteSubmit = $(this);
        if (delete_safety) {
            $('#delete-confirm').dialog({
                resizable:  false,
                height:     160,
                modal:      true,
                buttons: [
                  {
                    text: localized.get('Confirm'),
                    click: function() {
                      delete_safety = 0;
                      $(this).dialog('close');
                      $deleteSubmit.click();
                    }
                  },
                  {
                    text: localized.get('Cancel'),
                    click: function() {
                      $(this).dialog('close');
                    }
                  }
                ]
            });
            return false;
        }
    });
    forms.setupImageUpload($editForm);

    var ac = new google.maps.places.Autocomplete(
            $editForm.find('input[name="address"]')[0], { types: ['geocode'] });
    google.maps.event.addListener(ac, 'place_changed', function() {
        var place = ac.getPlace();
        var loc = { latitude:   place.geometry.location.lat(),
                    longitude:  place.geometry.location.lng() };
        Object.keys(loc).forEach(function(k) {
            $editForm.find('input[name="'+k+'"]').val(loc[k]);
        });
    });

    function onLogin() {
        $('#owner-panel').removeClass('hidden');
    }

    function onLogout() {
        $('#owner-panel').addClass('hidden');
    }

    webmakerAuth.on('login', onLogin);
    webmakerAuth.on('logout', onLogout);
    webmakerAuth.on('verified', function(user) {
        if ( user ) {
            return onLogin();
        }
        onLogout();
    });

    webmakerAuth.verify();
});
