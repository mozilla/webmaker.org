define( ["jquery", "text!html/ui-fragments.html" ], function( $, _fragments ) {
  "use strict";

  var UI = {},
      $fragments = $( document.createElement( "div" ) ).html( _fragments );

  UI.select = function( select, fn ) {
    var $el = $( ".ui-select", $fragments ).clone( true ),
        $toggleBtn = $el.find( ".icon" ),
        $selectedEl = $el.find( ".ui-selected" ),
        $menuContainer = $el.find( ".ui-select-menu" ),
        $menu = $menuContainer.find( "ul" ),
        $li = $menu.find( "li" );

    var $select = $( select ),
        $options = $( "option", select ),
        id = $select.attr( "id" );

    fn = fn || function() {};

    $options.each( function( i, option ) {
      var val = $( option ).val(),
          html = $( option ).html(),
          $newLi = $li.clone();
      $newLi.attr( "data-value", val );
      $newLi.html( html );
      if ( $( option ).attr( "selected" ) ) {
        $newLi.attr( "data-selected", true);
        $selectedEl.html( html );
      }
      $newLi.click( function() {
        var $this = $( this );

        $menu.find( "[data-selected]" ).removeAttr( "data-selected" );
        $( this ).attr( "data-selected", true );
        $selectedEl.text( html );
        $menuContainer.hide();
        fn( val );
        $select.val( val );

      });
      $menu.append( $newLi );
    });

    $selectedEl.click( function( e ) {
      $menuContainer.toggle();
    });
    $toggleBtn.click( function( e ) {
      $menuContainer.toggle();
    });

    $el.attr( "id", id );
    $select.removeAttr( "id" );

    $li.remove();
    $el.insertAfter( $select );
    $select.hide();
  };

  return UI;

});
