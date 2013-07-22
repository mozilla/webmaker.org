/*

    Marquee

    TODO:
    - dynamically zero out margin on rightmost item (?)

*/

define(['jquery'], function ($) {

  /**
   * Marquee Constructor
   * @param  {object} target jQuery or native element reference
   * @param  {object} options
   * @return {undefined}
   */
  var Marquee = function (target, options) {
    var self = this,
      defaults,
      option;

    // Options ----------------------------------------------------------------

    defaults = {
      itemsPerGroup: 3,
      rotationSpeed: 5000, // Milliseconds
      fadeInSpeed: 1000
    };

    for (option in options) {
      defaults[option] = options[option] || defaults[option];
    }

    self.options = defaults;

    // Element references -----------------------------------------------------

    self.$container = $(target);
    self.$items = self.$container.children();

    // Properties -------------------------------------------------------------

    self.firstVisibleItemIndex = 0;
    self.itemCount = self.$items.length;
    self.visibleItems = [];
    self.rotationInterval = null; // Will become 'setInterval' reference
    self.isRotating = false;

    // Setup ------------------------------------------------------------------

    self.$items.fadeTo(0, 0).hide();
  };

  Marquee.prototype = {

    /**
     * Animate in a group of items
     * @param  {number} firstItemIndex
     * @return {undefined}
     */
    showGroup: function (firstItemIndex) {
      var self = this,
        group = [],
        i = 0;

      // Hide the currently visible group

      self.visibleItems.forEach(function (index) {
        self.$items.eq(index).hide();
      });

      // Build an array of indexes for next group to show

      while (i < self.options.itemsPerGroup) {
        // Loop around to start of array if necessary
        if (firstItemIndex >= self.itemCount) {
          firstItemIndex = firstItemIndex % self.itemCount;
        }

        group.push(firstItemIndex);

        firstItemIndex++;
        i++;
      }

      self.visibleItems = group;

      // Sort so that names animate in left to right

      group.sort(function (a, b) {
        return a > b;
      });

      // Fade in new group one-by-one

      group.forEach(function (itemIndex, i) {
        self.$items.eq(itemIndex).fadeTo(0, 0);

        setTimeout(function () {
          self.$items.eq(itemIndex).fadeTo(self.options.fadeInSpeed, 1);
        }, i * (self.options.fadeInSpeed / 4));
      });

    },

    /**
     * Start a periodic rotation of visible item groups
     * @return {undefined}
     */
    startRotation: function () {
      var self = this;

      self.isRotating = true;

      function showNextGroup() {
        if (self.visibleItems.length) {
          self.showGroup(self.visibleItems[self.visibleItems.length - 1] + 1);
        } else {
          self.showGroup(0);
        }
      }

      showNextGroup(); // Immediately show the first group

      self.rotationInterval = setInterval(showNextGroup, self.options.rotationSpeed);
    },

    /**
     * Stop rotating visible items
     * @return {undefined}
     */
    stopRotation: function () {
      var self = this;

      clearInterval(self.rotationInterval);
      self.isRotating = false;
    }
  };

  return Marquee;

});
