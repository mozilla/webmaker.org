module.exports = function (Model, Types) {
    Model('GalleryImage', {
        uri:                                Types.URL,
    }, function (M) {
        this.belongsTo( M.Gallery, { as: 'Gallery' } );
    });
};
