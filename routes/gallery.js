var make = require('../lib/makeapi').readOnly;

module.exports = function (options) {
  return function (req, res, next) {
    var DEFAULT_LAYOUT = 'index',
      DEFAULT_LIMIT = 12,
      layouts = {
        index: {
          template: 'make-teach.html',
          tags: ['webmaker:featured']
        }
      };

    options = options || {};

    // layout: Choose a layout - should it look like the home or teach page?
    // Sets the processing function and template piece
    var layoutName = options.layout || (req.query.layout || DEFAULT_LAYOUT).toString(),
      layout = layouts[layoutName] || layouts[DEFAULT_LAYOUT];
    layout.name = layoutName;

    // page: This is for rendering the view.
    var page = options.page || layoutName;

    // limit
    var limit = options.limit || DEFAULT_LIMIT;

    make.setLang(req.localeInfo.momentLang);

    make
      .find({
        tags: {
          tags: layout.tags
        },
        limit: limit,
        sortByField: ['createdAt', 'desc']
      })
      .process(function (err, makes, totalHits) {
        res.render(page + '.html', {
          makes: makes,
          totalHits: totalHits,
          limit: limit,
          page: page,
          layout: layout.name,
          template: layout.template,
          isAdmin: req.session.user ? req.session.user.isAdmin : false
        });
      }, req.session.user ? req.session.user.id : '');
  };
};
