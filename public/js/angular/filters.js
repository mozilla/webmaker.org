angular
  .module('webmakerApp')
  .filter('rfc3339', function () {
    return function (timestamp) {
      if (timestamp) {
        return new Date(timestamp).toISOString();
      }
    };
  })
  .filter('decode', function () {
    return function (tag) {
      tag = tag || '';
      return decodeURIComponent(tag);
    };
  })
  .filter('urlsToLinks', function () {
    return function (text) {
      return text.replace(/(https?:\/\/[\S]*)/g, '<a href="$1" target="_blank">$1</a>');
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
        if (likes.length < 2) {
          return 'Like-' + likes.length;
        }
        return 'Like-n';
      }
    };
  })
  .filter('generateGravatar', function () {
    return function (hash) {
      var
      defaultAvatar = 'https%3A%2F%2Fstuff.webmaker.org%2Favatars%2Fwebmaker-avatar-44x44.png',
        defaultSize = 44;
      return 'https://secure.gravatar.com/avatar/' + hash + '?s=' + defaultSize + '&d=' + defaultAvatar;
    };
  });
