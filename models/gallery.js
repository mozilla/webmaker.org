module.exports = function (Model, Types) {
    Model('Gallery', {
        uri:                                Types.URL,
    }, function (M) {
        this.hasMany  ( M.GalleryImage, { as: 'Images' } );
        this.belongsTo( M.Event,        { as: 'Event'  } );
    });
};
