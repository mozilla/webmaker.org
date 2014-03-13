module.exports.checkAdmin = function (req, res, next) {
  if (!req.session.user || !req.session.user.isAdmin) {
    return next(new Error("Admin access only"));
  }
  return next();
};

module.exports.removeXFrameOptions = function (req, res, next) {
  res.removeHeader("x-frame-options");
  next();
};
