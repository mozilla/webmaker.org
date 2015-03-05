module.exports = function (req, res) {
  var make = require('../lib/makeapi').authenticated;
  var id = req.body.makeID;

  make.id(id).then(function (err, data) {
    if (err) {
      return res.send(err);
    }

    if (data && !data.length) {
      return res.send('Sorry, we couldn\'t find a make with that id!');
    }

    var username = data[0].username;

    if (req.session.user && username === req.session.user.username) {
      make.remove(id, function (err, data) {
        if (err) {
          res.send(err);
        } else {
          res.json(data);
        }
      });
    } else {
      res.json({
        error: 'You do not have permission to delete this make'
      });
    }
  });
};
