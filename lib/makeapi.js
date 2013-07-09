module.exports = function(options) {
  var moment = require("moment");
  var makeClient = require("makeapi-client")(options);

  function generateGravatar(hash) {
    var DEFAULT_AVATAR = "http%3A%2F%2Fstuff.webmaker.org%2Favatars%2Fwebmaker-avatar-44x44.png",
        DEFAULT_SIZE = 44;
    return "https://secure.gravatar.com/avatar/" + hash + "?s="+ DEFAULT_SIZE +"&d=" + DEFAULT_AVATAR;
  }

  // Given a prefix for an app tag (e.g. "webmaker:p-") sort an array of makes based on that tag
  // The tag must be of the format "prefix-1", "prefix-2", etc.
  makeClient.sortByPriority = function(prefix, data) {
    var sortedData = [],
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

    for (var i=0; i<data.length; i++) {
      priorityIndex = extractStickyPriority(data[i].appTags) - 1;
      data[i].index = priorityIndex + 1;
      sortedData[priorityIndex] = data[i];
    }
    return sortedData;
  };

  makeClient.process = function(callback) {
    makeClient.then(function(err, data, totalHits) {
      if (err) {
        return callback(err);
      }

      if (!Array.isArray(data) ) {
        return callback("There was no data returned");
      }

      var make;

      for (var i = 0; i < data.length; i++) {
        make = data[i];

        // Set the tool
        make.tool = make.contentType.replace(/application\/x\-/g, "");

        // Convert tags and set the "make.type"
        if (make.taggedWithAny(["guide"])) {
          make.type = "guide";
        } else if (make.contentType) {
          make.type = make.tool;
        }

        // Convert the created at and updated at to human time
        make.updatedAt = moment(data[i].updatedAt).fromNow();
        make.createdAt = moment(data[i].createdAt).fromNow();

        // Set the remix URL
        make.editurl = make.url + "/edit";
        make.remixurl = make.url + "/remix";

        // Create a function for generating the avatar
        make.avatar = generateGravatar(make.emailHash);
      }

      callback(err, data, totalHits);
    });
  };

  module.exports = makeClient;
};

