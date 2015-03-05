var hatchet = require('hatchet');

module.exports = function (req, res) {
  if (!req.session.user) {
    return res.send(401, new Error('You must be logged in to submit a resource'));
  }
  var data = req.body;
  hatchet.send('suggest_featured_resource', {
    email: req.session.user.email,
    userId: req.session.user.id,
    username: req.session.user.username,
    language: data.language,
    link: data.link,
    webliteracy: data.webliteracy
  });
  res.json(200);
};
