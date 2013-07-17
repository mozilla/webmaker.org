module.exports = function () {
    try {
        var initial_data = require('../fixtures/initial_data.json');
    } catch (e) { return false }

    var orm = this.orm;
    orm.sequelize.sync().success(function() {
        process.stderr.write('Loading fixtures... ');
        initial_data.forEach(function (m) {
            var Model = orm.models[m.model],
                data  = {};
            Object.keys(orm.models[m.model].attributes).forEach(function (k) {
                data[k] = m.data[k];
            });
            delete data.id;
            Model.findOrCreate({ createdAt: data.createdAt }, data)
                .success(function(instance, saved) { process.stderr.write('.') })
                .error(function(err){ process.stderr.write('!('+err+')') });
        }, this)
        process.stderr.write(' [DONE]\n');
    }).error(console.error.bind(console));
    return true;
};
