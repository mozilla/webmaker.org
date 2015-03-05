var hatchet = require('hatchet');

module.exports = function (req, res) {
  var body = req.body;

  if (!body.to) {
    return res.json(400, {
      error: 'Missing to parameter'
    });
  }

  hatchet.send('send_sms', {
    to: body.to,
    body: req.gettext('install webmaker sms text')
  });
  res.json(200);
};
