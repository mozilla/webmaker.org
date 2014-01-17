var loginAPI = require("./loginapi");

module.exports.checkAdmin = function (req, res, next) {
  loginAPI.getUserByEmail(req.session.email, function (err, user) {
    if (err || !user || !user.isAdmin) {
      return next(new Error("Admin access only"));
    }
    req.isAdmin = true;
    return next();
  });
};

module.exports.removeXFrameOptions = function (req, res, next) {
  res.removeHeader("x-frame-options");
  next();
};
