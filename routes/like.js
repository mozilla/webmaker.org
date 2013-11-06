module.exports = function () {
  var make = require("../lib/makeapi");
  return {
    like: function (req, res) {
      var id = req.body.makeID,
        maker = req.session.username;

      if (maker) {
        make.like(id, maker, function (err, data) {
          if (err || !data) {
            return res.send(400, err || "Something went wrong.");
          }
          res.json(200, data);
        });
      } else {
        res.send(401, "Not Logged In");
      }
    },
    unlike: function (req, res) {
      var id = req.body.makeID,
        maker = req.session.username;

      if (maker) {
        make.unlike(id, maker, function (err, data) {
          if (err || !data) {
            return res.send(400, err || "something went wrong");
          }
          res.json(200, data);
        });
      } else {
        res.send(401, "Not Logged In");
      }
    }
  };
};
