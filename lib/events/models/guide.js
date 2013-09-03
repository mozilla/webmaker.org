module.exports = function (Model, Types) {
    Model('Guide', {
        uri:                                Types.URL,
    }, function (M) {
        this.belongsTo( M.Event, { as: 'Event' } );
    });
};
