module.exports = {
  up: function(migration, t, done) {
    // add altering commands here, calling 'done' when finished
    migration.addColumn('Events', 'featured', {
        type:           t.BOOLEAN,
        defaultValue:   false,
    }).complete(done);
  },
  down: function(migration, t, done) {
    // add reverting commands here, calling 'done' when finished
    migration.removeColumn('Events', 'featured').complete(done);
  }
}
