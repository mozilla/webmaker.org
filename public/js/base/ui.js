define( ["jquery"], function( $ ) {
  "use strict";

  var UI = {};

  UI.select = function( el, fn ) {
    var $el = $( el ),
        $toggleBtn = $el.find( ".icon" ),
        $selectedEl = $el.find( ".ui-selected" ),
        $menu = $el.find( ".ui-select-menu" ),
        $firstSelected = $el.find( "[data-selected]" );

    fn = fn || function() {};

    $toggleBtn.click( function( e ) {
      $menu.toggle();
    });

    $selectedEl.click( function( e ) {
      $menu.toggle();
    });

    $menu.click( function( e ) {
      var $li = $( this ).find( "li" ),
          $target = $( e.target );
      $li.removeClass( "ui-on" );
      $target.addClass( "ui-on" );
      $selectedEl.html( $target.html() );
      $menu.hide();
      fn(  $target.data( "value" ) ) ;
    });

    $menu.hide();
    if ( $firstSelected ) {
      $selectedEl.html( $firstSelected.html() );
      $firstSelected.addClass( "ui-on" );
    }
  };

  return UI;

});
