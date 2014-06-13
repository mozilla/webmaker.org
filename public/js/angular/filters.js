angular
  .module('webmakerApp')
  .filter('rfc3339', function () {
    return function (timestamp) {
      if (timestamp) {
        return new Date(timestamp).toISOString();
      }
    };
  })
  .filter('openGraphLocale', function () {
    return function (locale) {
      if (locale) {
        return locale.replace('-', '_');
      }
    };
  })
  .filter('likesText', function () {
    return function (likes) {
      if (likes) {
        var likesText;

        switch (likes.length) {
        case 0:
          likesText = 'Like-0';
          break;
        case 1:
          likesText = 'Like-1';
          break;
        default:
          likesText = 'Like-n';
        }
        return likesText;
      }
    };
  })
  .filter('generateGravatar', function () {
    return function (hash) {
      var
      default_avatar = "https%3A%2F%2Fstuff.webmaker.org%2Favatars%2Fwebmaker-avatar-44x44.png",
        default_size = 44;
      return "https://secure.gravatar.com/avatar/" + hash + "?s=" + default_size + "&d=" + default_avatar;
    };
  });
