module.exports = {
  api: {
    healthcheck: require('./api/healthcheck'),
    submitResource: require('./api/submitResource'),
    sendSMS: require('./api/sendSMS')
  },
  angular: require('./angular'),
  app: require('./app'),
  badges: require('./badges'),
  details: require('./details'),
  gallery: require('./gallery'),
  gallery_old: require('./gallery_old'),
  me: require('./me'),
  page: function (view) {
    return require('./page')(view);
  },
  remove: require('./remove'),
  like: require('./like')(),
  literacy: require('./literacy'),
  report: require('./report')(),
  search: require('./search'),
  tag: function (req, res) {
    res.redirect('/' + req.localeInfo.lang + '/search?type=tags&q=' + req.params.tag);
  },
  usersearch: function (req, res) {
    res.redirect('/' + req.localeInfo.lang + '/search?type=user&q=' + req.params.user);
  }
};
