module.exports = function (view) {
  return function (req, res) {
    res.render(view + '.html', {
      page: view,
      direction: req.localeInfo.direction === 'rtl' ? 'left' : 'right'
    });
  };
};
