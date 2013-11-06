module.exports = function (req, res) {
  var make = require("../lib/makeapi"),
    username = req.session.username,
    page = req.query.page || 1,
    app = req.query.app,
    options = {},
    limit = 50;

  // MakeAPI doesn't handle undefined being passed for user. To
  // prevent the MakeAPI error showing when no signed in user accesses the page
  // I'm checking here first.
  if (!username) {
    res.render("me.html", {
      page: "me",
      view: app || "webmaker"
    });
    return;
  }

  // Set up search options
  options.user = username;
  if (app) {
    options.contentType = "application/x-" + app;
  }

  make.setLang(req.localeInfo.momentLang);
  make.find(options)
    .limit(limit)
    .sortByField("updatedAt", "desc")
    .page(page)
    .process(function (err, data, totalHits) {
      if (err) {
        return res.send(err);
      }

      res.render("me.html", {
        makes: data || [],
        page: "me",
        pagination: page,
        view: app || "webmaker",
        totalHits: totalHits,
        limit: limit,
        showPagination: (totalHits > limit),
        username: username
      });
    });
};
