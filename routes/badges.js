var BadgeClient = require('badgekit-api-client');

module.exports = function (env) {

  var badgeClient = new BadgeClient(env.get('BADGES_ENDPOINT'), {
    key: env.get('BADGES_KEY'),
    secret: env.get('BADGES_SECRET')
  });

  return {
    details: function (req, res, next) {

      badgeClient.getBadge({
        system: env.get('BADGES_SYSTEM'),
        badge: req.params.badge
      }, function (err, data) {

        if (err) {
          return res.render('badge-not-found.html', {
            page: 'badges'
          });
        }

        // Add tags manually for now.
        data.tags = ['supermentor', 'mentor', 'contribution', 'mozilla', 'community'];

        // Shim for https://bugzilla.mozilla.org/show_bug.cgi?id=1001161
        if (data.issuer && !data.issuer.imageUrl) {
          data.issuer.imageUrl = 'https://webmaker.org/img/logo-webmaker.png';
        }

        // Can the current user issue this badge?
        var canIssue = req.session.user && req.session.user.isAdmin || (req.session.user.isCollaborator && data.slug !== 'webmaker-super-mentor');

        res.render('badge-detail.html', {
          page: 'badges',
          badge: data,
          canIssue: canIssue
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
          return res.send(500, err);
        }
        res.send(data);
      });
    },
    issue: function (req, res, next) {

      if (!req.session.user || !(req.session.user.isAdmin || req.session.user.isCollaborator)) {
        return res.send(400, {
          error: 'Sorry, you must be an admin or collaborator to issue badges'
        });
      }

      if (req.params.badge === 'webmaker-super-mentor' && !req.session.user.isAdmin) {
        return res.send(400, {
          error: 'Sorry, you cannot issue a super mentor badge directly. Please have your applicant apply instead.'
        });
      }

      var query = {
        system: env.get('BADGES_SYSTEM'),
        email: req.body.email,
        badge: req.params.badge,
        comment: req.body.comment
      };

      badgeClient.createBadgeInstance(query, function (err, data) {
        if (err) {
          var errorString = err.toString();
          return res.send(500, {
            error: errorString
          });
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
