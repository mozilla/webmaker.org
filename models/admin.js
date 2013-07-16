module.exports = function (Model, t) {
    Model('Admin', {
        user:                               t.Email,

        $classMethods: {
            checkUser: function(email) {
                return this.count({ where: { user: email }}) > 0
            }
        }
    }, function (M) {
    });
};
