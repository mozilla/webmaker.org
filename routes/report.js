module.exports = function () {
  var make = require("../lib/makeapi");
  return {
    report: function (req, res) {
      var id = req.body.makeID,
        maker = req.session.username;
      if (maker) {
        make.report(id, maker, function (err, data) {
          if (err || !data) {
            return res.json(400, err || "An unknown error occured :(");
          }
          res.json(200, data);
        });
      } else {
        res.json(401, "Not Logged In");
      }
    },
    cancelReport: function (req, res) {
      var id = req.body.makeID,
        maker = req.session.username;

      if (maker) {
        make.cancelReport(id, maker, function (err, data) {
          if (err || !data) {
            return res.json(400, err || "An unknown error occured :(");
          }
          res.json(200, data);
        });
      } else {
        res.json(401, "Not Logged In");
      }
    }
  };
};
