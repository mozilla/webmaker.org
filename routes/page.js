module.exports = function( view, makeURL, personaSSO, loginAPI ) {
  return function( req, res ) {
    res.render( view + ".html", {
      csrf: req.session._csrf,
      email: req.session.email || '',
      loginAPI: loginAPI,
      makeEndpoint: makeURL,
      personaSSO: personaSSO,
      page: view,
      webmakerID: req.session.username || ''
    } );
  };
};
