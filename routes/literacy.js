var WebLitClient = require('web-literacy-client');
var wlc = new WebLitClient();

module.exports = function (req, res) {
  wlc.lang(req.localeInfo.lang);
  return res.render('literacy.html', {
    page: 'literacy',
    wlc: wlc
  });
};
