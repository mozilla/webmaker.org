module.exports = function (Model, t) {
    Model('Admin', {
        user:                               t.Email,

        $classMethods: {
            checkUser: function(email, cb) {
                this.count({ where: { user: email }})
                    .success(function (c) { cb(c > 0) })
                    .error(console.error.bind(console));
            }
        }
    }, function (M) {
    });
};
