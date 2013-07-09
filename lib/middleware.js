var loginAPI = require("./loginapi");

module.exports.checkAdmin = function(req, res, next) {
  loginAPI.isAdmin(req.session.email, function(err, isAdmin){
    if (err || !isAdmin) {
      return next(new Error("Admin access only"));
    }
    return next();
  });
};
