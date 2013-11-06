module.exports = function (domains) {
  var realmResponse;

  if (domains) {
    realmResponse = {
      realm: domains.split(" ")
    };
  }

  return function (req, res, next) {
    if (!realmResponse) {
      return res.send(404);
    }

    res.json(realmResponse);
  };
};
