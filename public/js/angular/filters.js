angular
  .module('webmakerApp')
  .filter('openGraphLocale', function () {
    return function (locale) {
      if (locale) {
        return locale.replace('-', '_');
      }
    };
  });
