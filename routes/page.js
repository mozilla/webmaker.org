module.exports = function( view ) {
  return function( req, res ) {
    res.render( view + ".html", {
      page: view
    });
  };
};
