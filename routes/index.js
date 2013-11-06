module.exports = {
  api: {
    healthcheck: require("./api/healthcheck")
  },
  browserid: require("./browserid"),
  details: require("./details"),
  gallery: require("./gallery"),
  include: function (options) {
    return function (req, res) {
      res.render("sso/include.html", options);
    };
  },
  includejs: function (hostname) {
    return function (req, res) {
      res.set("Content-Type", "application/javascript;charset=utf-8");
      res.render("sso/include.js", {
        HOSTNAME: hostname
      });
    };
  },
  me: require("./me"),
  page: function (view) {
    return require("./page")(view);
  },
  remove: require("./remove"),
  like: require("./like")(),
  search: require("./search"),
  tag: function (req, res) {
    res.redirect("/" + req.localeInfo.lang + "/search?type=tags&q=" + req.params.tag);
  },
  user: require("./user"),
  usersearch: function (req, res) {
    res.redirect("/" + req.localeInfo.lang + "/search?type=user&q=" + req.params.user);
  }
};
