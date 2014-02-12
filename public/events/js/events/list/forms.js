define(['jquery', 'model', 'forms', 'localized', 'nunjucks', 'base/login', 'bootstrap-markdown', 'domReady!'],
  function ($, EventModel, forms, localized, nunjucks, webmakerAuth) {
    return function (mapMaker) {
      // instantiate nunjucks
      nunjucks.env = new nunjucks.Environment(new nunjucks.HttpLoader('/views', true));
      nunjucks.env.addFilter('gettext', function (data) {
       return localized.get(data);
      });
      var $findForm = $('form#find-event');
      $findForm.find('button[type="submit"]').click(function (ev) {
       ev.preventDefault();
       $findForm.submit();
      });
      var $when_start = $findForm.find('input[name="when-start"]'),
      $when_end = $findForm.find('input[name="when-end"]'),
      $where = $findForm.find('input[name="where"]');

      $findForm.find('[name|="when"]').on("change", function() {
       if (new Date($when_start.val()) > new Date($when_end.val())) {
         $(this).val((this.name == 'when-start' ? $when_end : $when_start).val());
       } else {
         $findForm.submit();
       }
      });

      $when_start.datepicker('setDate', new Date())
      // when start box is closed, if a date was selected, open end box
      .datepicker('option', 'onClose', function(dateText, inst) {
       if (dateText) {
         $(inst).datepicker('hide');
         $when_end.datepicker('show');
       }
      });

      $findForm.on("submit", function(ev) {
       ev.preventDefault();

       var target_start = $when_start[0].value,
       target_end   = $when_end[0].value,
       target_where = $where[0].value;

       var earliest = target_start ? new Date(target_start) : null,
       latest   = target_end   ? new Date(target_end)   : null;

       EventModel.getEventsBetweenDates(earliest, latest, target_where, '/events/list',function (models) {
         var html = nunjucks.env.render('events/list-item.html', {events: models});
         $('#list').html(html);
       });
      });
      $findForm.submit();
      /// XXX: replace the below
      mapMaker.setupAutocomplete($where[0], true, function (place) {
       // on autocomplete
      });

      $.validator.addMethod('afterStartDate', function(val, endElem) {
       var start   = $('#event_beginDate').val(),
       end     = $(endElem).val();
       if (start && end)
         return new Date(start) <= new Date(end);
       else return true;
      }, "End date must be after start date.");

      var $createForm = $('form#create-event'),
      $createFormArea = $('form#create-event .create-event-form'),
      $eventConfirmation = $('form#create-event .create-event-confirmation');
      $createForm.validate({
       rules: {
         title: 'required',
         registerLink: 'url',
         address: 'required',
         beginDate: 'required',
         endDate: 'required afterStartDate',
       },
       submitHandler: function() {
         var form_fields = $createForm.serializeArray();
         var data = { event: {} };
         form_fields.forEach(function (f) {
           if (f.name) switch (f.name) {
             case '_csrf':
               data[f.name] = f.value;
             break;
             case 'address': // TODO: split address into two lines
               default:
               data.event[f.name] = f.value;
           }
         });
         $.post($createForm.attr('action'), data, function (data) {
           if (data.event) {
             var evt = new EventModel(data.event);
             $where.val('');
             // XXX: add event to list
             openEventConfirmation(evt);
           }
         }, 'json');
       },
       errorPlacement: function ($errors, $elem) {
         $elem.prop('placeholder', $errors.first().text());
       },
       highlight: function (input, errorClass, validClass) {
         var $parent = $(input).parent('.ui-append');
         $parent.addClass(errorClass).removeClass(validClass);
       },
       unhighlight: function (input, errorClass, validClass) {
         var $parent = $(input).parent('.ui-append');
         $parent.addClass(validClass).removeClass(errorClass);
       }
      });
      var $beginTime = $createForm.find('[name="beginTime"]'),
      $endTime   = $createForm.find('[name="endTime"]');
      $beginTime.timepicker('option', {
       appendTo: function (elem) { return $(elem).parent() }
      });
      $endTime.timepicker('option', {
       appendTo: function (elem) { return $(elem).parent() }
      });

      // XXX: replace the below
      mapMaker.setupAutocomplete($createForm.find('input[name="address"]')[0], false, function (place) {
       if (place && place.geometry) {
         var loc = { latitude:   place.geometry.location.lat(),
           longitude:  place.geometry.location.lng() };
           for (var k in loc)
             $createForm.find('input[name="'+k+'"]').val(loc[k]);
       }
      });

      forms.setupImageUpload($createForm);
      forms.setupSelectUI($createForm);

      function openEventConfirmation( event ) {
       var href = '/events/' + event.id;
       $createFormArea.toggleClass('hidden');
       $eventConfirmation.toggleClass('hidden');
       $('.confirmation-link a')
       .attr('href', href)
       .text(window.location.protocol + "//" + window.location.host  + href);
       $('#map-canvas').bind( 'click', function clickCallback() {
         toggleCreateForm();
         $('#map-canvas').unbind( 'click', clickCallback );
       });
      }

      // setup form toggle button
      function toggleCreateForm() {
        $createForm[0].reset();
        $createForm.toggleClass('hidden');
        $createFormArea.removeClass('hidden');
        $eventConfirmation.addClass('hidden');
        $(".overlay-buttons").toggleClass('hidden');
      }
      $(".expand-form-button").click(toggleCreateForm);

      $(".loggedout-expand-form-button").on('click', webmakerAuth.login);

      localized.ready(function(){
        function onLogin(){
          var $button = $('.loggedout-expand-form-button')
              .removeClass('loggedout-expand-form-button')
              .addClass('expand-form-button')
              .on('click', toggleCreateForm)
              .off('click', webmakerAuth.login);
          $('.event-button-text', $button).text( localized.get("Add an Event") );
        }

        function onLogout(){
          var $button = $('.expand-form-button')
              .addClass('loggedout-expand-form-button')
              .removeClass('expand-form-button')
              .off('click', toggleCreateForm)
              .on('click', webmakerAuth.login);
          $('.event-button-text', $button).text( localized.get("Log in to add an Event") );
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
  }}
);
