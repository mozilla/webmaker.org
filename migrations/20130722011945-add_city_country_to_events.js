module.exports = {
  up: function(migration, t, done) {
    // add altering commands here, calling 'done' when finished
    migration.addColumn('Events', 'city', t.STRING).complete(function(err) {
        if (err)
            return done(err);
        migration.addColumn('Events', 'country', t.STRING).complete(done);
    });
  },
  down: function(migration, t, done) {
    // add reverting commands here, calling 'done' when finished
    migration.removeColumn('Events', 'city').complete(function(err) {
        if (err)
            return done(err);
        migration.removeColumn('Events', 'country').complete(done);
    });
  }
}
