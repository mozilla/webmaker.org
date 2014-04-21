var BadgeClient = require('badgekit-api-client');

module.exports = function (env) {

  // var ALLOWED_BADGES = env.get('BADGES_ALLOWED_BADGES');

  var badgeClient = new BadgeClient(env.get('BADGES_ENDPOINT'), {
    key: env.get('BADGES_KEY'),
    secret: env.get('BADGES_SECRET')
  });

  return {
    details: function (req, res, next) {
      // if (ALLOWED_BADGES && ALLOWED_BADGES.indexOf(req.params.badge) === -1) {
      //   return res.render('badge-not-found.html');
      // }
      badgeClient.getBadge({
        system: env.get('BADGES_SYSTEM'),
        badge: req.params.badge,
      }, function (err, data) {
        if (err) {
          return res.render('badge-not-found.html', {
            page: 'badges'
          });
        }

        // Add tags manually for now.
        data.tags = ['supermentor', 'mentor', 'contribution', 'mozilla', 'community'];

        res.render('badge-detail.html', {
          page: 'badges',
          badge: data
        });
      });

    },
    apply: function (req, res, next) {
      var application = {
        learner: req.session.user.email,
        evidence: [{
          reflection: req.body.evidence
        }]
      };

      badgeClient.addApplication({
        system: env.get('BADGES_SYSTEM'),
        badge: req.params.badge,
        application: application
      }, function (err, data) {
        if (err) {
          return next(err);
        }
        res.send(data);
      });
    }
    // Note: Claimcode is not implemented yet in badgekit-api
    // claimcode: function (req, res, next) {
    //   badgeClient.claimClaimCode({
    //     system: 'webmaker-badges'
    //   }, req.session.user.email, function(err, data) {
    //     res.send(data);
    //   });
    // }
  };

};
