var BadgeClient = require('badgekit-api-client');
var async = require('async');

module.exports = function (env) {
  // Error messages
  var errorHandlers = {
    unauthorized: function () {
      var err = new Error('You must be logged in to access this area.');
      err.status = 401;
      return err;
    },
    forbidden: function () {
      var errorString = 'You are not authorized to access this area. ' +
        'If you think you are supposed to have permissions, ' +
        'try logging out and in again, or contact help@webmaker.org';
      var err = new Error(errorString);
      err.status = 403;
      return err;
    }
  };

  var badgeClient = new BadgeClient(env.get('BADGES_ENDPOINT'), {
    key: env.get('BADGES_KEY'),
    secret: env.get('BADGES_SECRET')
  });

  var permissionsModel = require('../lib/badges-permissions-model.js');

  return {
    middleware: {
      // Check if a use has at least a certain level of permissions
      // Can be 'admin', 'superMentor' or 'mentor'
      atleast: function (level) {
        var levels = ['isAdmin', 'isSuperMentor', 'isMentor'];
        return function (req, res, next) {
          var user = req.session.user;
          if (!level || levels.indexOf(level) <= -1) {
            var problem = level + ' is not a valid type of user.';
            var err = new Error('There is a problem with the permissions model: ' + problem);
            return next(err);
          } else if (!user) {
            return next(errorHandlers.unauthorized());
          } else if (user.isAdmin) {
            return next();
          } else if (level === 'isSuperMentor' && (user.isAdmin || user.isSuperMentor)) {
            return next();
          } else if (level === 'isMentor' && (user.isAdmin || user.isSuperMentor || user.isMentor)) {
            return next();
          } else {
            return next(errorHandlers.forbidden());
          }
        };
      },
      // Does this user have permissions to issue, approve applications, see instances?
      hasPermissions: function (action) {
        return function (req, res, next) {
          var user = req.session.user;

          if (!user) {
            return next(errorHandlers.unauthorized());
          }

          var allowed = permissionsModel({
            badge: req.params.badge,
            user: req.session.user,
            action: action
          });

          if (!allowed) {
            return next(errorHandlers.forbidden());
          } else {
            return next();
          }
        };
      }
    },
    getAll: function (req, res, next) {
      badgeClient.getBadges({
        system: env.get('BADGES_SYSTEM')
      }, function (err, badges) {
        if (err) {
          return res.send(500, err.message);
        }
        res.json(badges);
      });
    },
    getBadge: function (req, res, next) {
      badgeClient.getBadge({
        system: env.get('BADGES_SYSTEM'),
        badge: req.params.badge
      }, function (err, data) {
        if (err) {
          return res.send(500, err.message);
        }
        return res.send(data);
      });
    },
    getInstances: function (req, res, next) {
      badgeClient.getBadgeInstances({
        system: env.get('BADGES_SYSTEM'),
        badge: req.params.badge
      }, function (err, instances) {
        // errorString
        if (err) {
          return res.send(500, err.message);
        }

        // We need to get the badge data too
        badgeClient.getBadge({
          system: env.get('BADGES_SYSTEM'),
          badge: req.params.badge
        }, function (err, badge) {
          if (err) {
            return res.send(500, err.message);
          }
          res.json({
            badge: badge,
            instances: instances
          });
        });
      });
    },
    deleteInstance: function (req, res, next) {
      badgeClient.deleteBadgeInstance({
        system: env.get('BADGES_SYSTEM'),
        badge: req.params.badge,
        email: req.params.email
      }, function (err, result) {
        if (err) {
          console.log(err.stack);
          return res.send(500, err.message);
        }
        res.send('DELETED');
      });
    },
    details: function (req, res, next) {
      function getBadge(callback) {
        badgeClient.getBadge({
          system: env.get('BADGES_SYSTEM'),
          badge: req.params.badge
        }, function (err, data) {
          return callback(err, data);
        });
      }

      function getInstance(callback) {
        if (req.session.user) {
          badgeClient.getBadgeInstance({
            system: env.get('BADGES_SYSTEM'),
            badge: req.params.badge,
            email: req.session.user.email
          }, function (err, data) {
            if (err && err.name === 'ResourceNotFoundError') {
              err = null;
            }
            return callback(err, data);
          });
        } else {
          return callback(null, null);
        }
      }

      function getApplication(callback) {
        if (req.session.user) {
          badgeClient.getApplications({
            system: env.get('BADGES_SYSTEM'),
            badge: req.params.badge
          }, {
            email: req.session.user.email,
            processed: false
          }, function (err, data) {
            return callback(err, data);
          });
        } else {
          return callback(null, null);
        }
      }
      async.parallel(
        [getBadge, getInstance, getApplication],
        function (err, results) {
          if (err) {
            return res.render('badge-not-found.html', {
              page: 'search',
              view: 'badges'
            });
          }

          var badge = results[0];
          var instance = results[1];
          var application = (results[2] && results[2].length) ? results[2][0] : null;

          // Shim for https://bugzilla.mozilla.org/show_bug.cgi?id=1001161
          if (badge.issuer && !badge.issuer.imageUrl) {
            badge.issuer.imageUrl = 'https://webmaker.org/img/logo-webmaker.png';
          }

          // Can the current user issue this badge?
          var canIssue = permissionsModel({
            badge: req.params.badge,
            user: req.session.user,
            action: 'issue'
          });

          // Do we want to ask which Hive city the earner is affiliated with?
          var requestCity = (req.params.badge === 'hive-community-member');

          // Check if we have any criteria to display.
          var canApply = true;
          if (['Data Trail Timeline', 'Privacy Coach', 'IP Address Tracer'].indexOf(badge.name) >= 0) {
            canApply = false;
          }

          res.render('badge-detail.html', {
            page: req.params.badge,
            view: 'badges',
            badge: badge,
            canIssue: canIssue,
            canApply: canApply,
            requestCity: requestCity,
            backpackUrl: env.get('BACKPACK_PUSH_URL'),
            assertionUrl: instance ? instance.assertionUrl : null,
            application: application
          });
        });
    },
    apply: function (req, res, next) {
      var evidence = [req.body.evidence];
      var applicationSlug = req.body.applicationSlug;

      if (req.body.city) {
        evidence.push('Hive City: ' + req.body.city);
      }

      evidence = evidence.map(function (evidence) {
        return {
          reflection: evidence
        };
      });

      var application = {
        learner: req.session.user.email,
        evidence: evidence,
        slug: applicationSlug
      };

      var apiFunction;
      if (applicationSlug) {
        apiFunction = badgeClient.updateApplication.bind(badgeClient);
      } else {
        apiFunction = badgeClient.addApplication.bind(badgeClient);
      }

      apiFunction({
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
      var apiFunction;
      var query = {
        system: env.get('BADGES_SYSTEM'),
        badge: req.params.badge,
        comment: req.body.comment
      };

      if (req.body.emails) {
        query.emails = req.body.emails;
        apiFunction = badgeClient.createBadgeInstances.bind(badgeClient);
      } else if (req.body.email) {
        query.email = req.body.email;
        apiFunction = badgeClient.createBadgeInstance.bind(badgeClient);
      } else {
        return res.send(500, {
          error: 'No email address provided'
        });
      }

      apiFunction(query, function (err, data) {
        if (err) {
          var errorString = err.toString();
          return res.send(500, {
            error: errorString
          });
        }
        res.send(data);
      });
    },
    claim: function (req, res, next) {
      var codeQuery = {
        system: env.get('BADGES_SYSTEM'),
        badge: req.params.badge,
        claimCode: req.body.claimcode
      };

      badgeClient.claimClaimCode(codeQuery, req.session.user.email, function (err, data) {
        if (err) {
          var errorString = err.message;
          if (err.code === 404) {
            errorString = 'The code "' + req.body.claimcode + '" could not be found';
          }
          return res.send(500, {
            error: errorString
          });
        }

        var instanceQuery = {
          system: env.get('BADGES_SYSTEM'),
          badge: req.params.badge,
          email: req.session.user.email
        };

        badgeClient.createBadgeInstance(instanceQuery, function (err, data) {
          if (err) {
            var errorString = err.message;
            return res.send(500, errorString);
          }

          res.send(data);
        });
      });
    },
    getApplications: function (req, res, next) {
      badgeClient.getApplications({
        system: env.get('BADGES_SYSTEM'),
        badge: req.params.badge
      }, function (err, raw) {
        if (err) {
          return res.send(500, err.message);
        }

        var applications = [];
        // No way to query for pending applications only.
        // See bug 1021009
        if (req.query.processed) {
          applications = raw;
        } else {
          raw.forEach(function (application) {
            if (!application.processed) {
              applications.push(application);
            }
          });
        }

        res.send(applications);
      });
    },
    submitReview: function (req, res, next) {
      var context = {
        system: env.get('BADGES_SYSTEM'),
        badge: req.params.badge,
        application: req.params.application,
        review: {
          author: req.session.email,
          comment: req.body.comment,
          reviewItems: req.body.reviewItems
        }
      };
      badgeClient.addReview(context, function (err, review) {
        if (err) {
          return res.send(500, err.message);
        }
        return res.send(200, 'Success');
      });
    },
    create: function (req, res, next) {
      var context = {
        system: env.get('BADGES_SYSTEM'),
        badge: req.body
      };
      badgeClient.createBadge(context, function (err, badge) {
        if (err) {
          return res.send(500, err.message);
        }
        return res.send(200, badge);
      });
    },
    update: function (req, res, next) {
      var context = {
        system: env.get('BADGES_SYSTEM'),
        badge: req.body
      };
      badgeClient.updateBadge(context, function (err, badge) {
        if (err) {
          return res.send(500, err.message);
        }
        return res.send(200, badge);
      });
    }
  };
};
