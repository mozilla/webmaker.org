module.exports.login = function (req, res) {
  res.render('user/login.html', {
    page: "login"
  });
};
module.exports.newaccount = function (req, res) {
  if (!req.session.email) {
    return res.redirect("/login");
  }
  res.render('user/new.html', {
    page: "new"
  });
};
