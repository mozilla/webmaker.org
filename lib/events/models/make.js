module.exports = function (Model, Types) {
    Model('Make', {
        uri:                                Types.URL,
    }, function (M) {
        this.belongsTo( M.Event, { as: 'Event' } );
    });
};
