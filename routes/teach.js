var async = require("async");
var make = require("../lib/makeapi");

module.exports = function(req, res) {
  var STICKY_PREFIX = "webmaker:teach-";

  function getMakes(options, callback) {
    make
      .find(options)
      .process( function( err, data, totalHits ) {
        callback(err, data);
      });
  }

  var stickyOptions = {
    tagPrefix: STICKY_PREFIX,
    limit: 12,
    sortByField: ["createdAt", "desc"]
  };

  var normalOptions = {
    tagPrefix: [STICKY_PREFIX, true], // true = NOT search
    tags: { tags: ['webmaker:recommended', 'guide'] },
    limit: 12,
    sortByField: ["createdAt", "desc"]
  };

  async.map([stickyOptions, normalOptions], getMakes, function(err, data) {
    var sticky = [],
        normal,
        all;

    if (err) {
      return res.send(err);
    }
    if (data[0].length) {
      sticky = make.sortByPriority(STICKY_PREFIX, data[0]);
    }

    normal = data[1];
    all = sticky.concat(normal);

    res.render( "teach.html", {
      makes: all || [],
      page: "teach"
    });
  });

};
