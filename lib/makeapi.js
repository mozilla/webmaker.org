var toolURL = {
  "application/x-popcorn": "https://popcorn.webmaker.org",
  "application/x-thimble": "https://thimble.webmaker.org",
  "application/x-x-ray-goggles": "https://goggles.webmaker.org"
};

module.exports = function (options) {
  var moment = require("moment");
  var makeClient = require("makeapi-client")(options);

  function generateGravatar(hash) {
    var DEFAULT_AVATAR = "https%3A%2F%2Fstuff.webmaker.org%2Favatars%2Fwebmaker-avatar-44x44.png",
      DEFAULT_SIZE = 44;
    return "https://secure.gravatar.com/avatar/" + hash + "?s=" + DEFAULT_SIZE + "&d=" + DEFAULT_AVATAR;
  }

  // Moment.js default language is 'en'. This function will override
  // the default language globally on the coming request for the homepage
  makeClient.setLang = function (lang) {
    moment.lang(lang);
  };

  // Given a prefix for an app tag (e.g. "webmaker:p-") sort an array of makes based on that tag
  // The tag must be of the format "prefix-1", "prefix-2", etc.
  makeClient.sortByPriority = function (prefix, data) {
    var sortedData = [],
      duplicates = [],
      priorityIndex,
      regex = new RegExp("^" + prefix + "(\\d+)$");

    function extractStickyPriority(tags) {
      var res;
      for (var i = tags.length - 1; i >= 0; i--) {
        res = regex.exec(tags[i]);
        if (res) {
          return +res[1];
        }
      }
    }

    for (var i = 0; i < data.length; i++) {
      priorityIndex = extractStickyPriority(data[i].appTags);
      data[i].index = priorityIndex;
      if (sortedData[priorityIndex - 1]) {
        duplicates.push("Duplicate found for " + prefix + priorityIndex);
      } else {
        sortedData[priorityIndex - 1] = data[i];
      }
    }

    return {
      results: sortedData,
      errors: duplicates
    };
  };

  makeClient.process = function (callback, id) {
    makeClient.then(function (err, data, totalHits) {
      if (err) {
        return callback(err);
      }

      if (!Array.isArray(data)) {
        return callback("There was no data returned");
      }

      data.map(function (make) {

        // Set the tool
        make.tool = make.contentType.replace(/application\/x\-/g, "");
        make.toolurl = toolURL[make.contentType];

        // Convert tags and set the "make.type"
        if (make.taggedWithAny(["guide"])) {
          make.type = "guide";
        } else if (make.taggedWithAny(["webmaker:template"])) {
          make.type = "template";
        } else if (make.contentType) {
          make.type = make.tool;
        }

        if (make.taggedWithAny(["beginner"])) {
          make.level = "beginner";
        } else if (make.taggedWithAny(["intermediate"])) {
          make.level = "intermediate";
        } else if (make.taggedWithAny(["advanced"])) {
          make.level = "advanced";
        }

        if (id) {
          make.hasBeenLiked = make.likes.some(function (like) {
            return like.userId === +id;
          });
        }

        // Convert the created at and updated at to human time
        make.updatedAt = moment(make.updatedAt).fromNow();
        make.createdAt = moment(make.createdAt).fromNow();

        // Set the remix URL
        make.editurl = make.url + "/edit";
        make.remixurl = make.url + "/remix";

        // Create a function for generating the avatar
        make.avatar = generateGravatar(make.emailHash);
      });

      callback(err, data, totalHits);
    });
  };

  module.exports = makeClient;
};
