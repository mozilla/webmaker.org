(function () {
  var permissionsModel = function (options) {
    var permissions = {
      'webmaker-super-mentor': {
        'issue': 3,
        'applications': 3,
        'viewInstances': 3,
        'delete': 3
      },
      'webmaker-mentor': {
        'issue': 2,
        'applications': 2,
        'viewInstances': 2,
        'delete': 3
      },
      '*': {
        'issue': 1,
        'applications': 1,
        'viewInstances': 1,
        'delete': 3
      }
    };

    if (!options) {
      throw new Error('You must pass an options object into permissionsModel');
    }
    if (!options.badge || !options.action) {
      throw new Error('You must pass an options object with badge and action into permissionsModel');
    }
    if (!options.user) {
      return false;
    }

    var badge = options.badge;
    var user = options.user;
    var action = options.action;

    // Set highest level
    var level;
    if (user.isAdmin) {
      level = 3;
    } else if (user.isSuperMentor) {
      level = 2;
    } else if (user.isMentor) {
      level = 1;
    } else {
      level = 0;
    }

    // Get badge model, if it exists
    var badgeModel = permissions[badge] || permissions['*'];

    // Check action
    if (level >= badgeModel[action]) {
      return true;
    } else {
      return false;
    }
  };

  // Depending on the environment we need to export our 'Make' object differently.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = permissionsModel;
  } else {
    if (typeof define === 'function' && define.amd) {
      define(function () {
        return permissionsModel;
      });
    } else {
      window.badgesPermissionsModel = permissionsModel;
    }
  }
}());
