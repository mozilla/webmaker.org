module.exports = {
  api: {
    healthcheck: require("./api/healthcheck")
  },
  angular: require("./angular"),
  badges: require("./badges"),
  details: require("./details"),
  gallery: require("./gallery"),
  me: require("./me"),
  page: function (view) {
    return require("./page")(view);
  },
  remove: require("./remove"),
  like: require("./like")(),
  literacy: require("./literacy"),
  report: require("./report")(),
  search: require("./search"),
  tag: function (req, res) {
    res.redirect("/" + req.localeInfo.lang + "/search?type=tags&q=" + req.params.tag);
  },
  usersearch: function (req, res) {
    res.redirect("/" + req.localeInfo.lang + "/search?type=user&q=" + req.params.user);
  }
};
