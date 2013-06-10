module.exports = function (Model, Types) {
    Model('Event', {
        title:                              Types.String,
        description:                        Types.Text,
        address:                            Types.String,
        latitude: {
            type:                           Types.Float,
            validate: {
                isFloat: true,
                min: -90.0, max: 90.0
            },
            allowNull:      true,
            defaultValue:   null,
        },
        longitude: {
            type:                           Types.Float,
            validate: {
                isFloat: true,
                min: -180.0, max: 180.0
            },
            allowNull: true,
            defaultValue: null,
        },
        attendees:                          Types.Int,      // (0..5)
        beginDate:                          Types.Date,
        endDate:                            Types.Date,
        beginTime:                          Types.Date,     // UTC
        endTime:                            Types.Date,
        registerLink:                       Types.URL,
        picture:                            Types.URL,
        organizer:                          Types.Email,

        $validate: {
            coordinates: function() {
                if (!!this.latitude ^ !this.longitude)
                    return false;
            },
        },
    }, function (M) {
        this.hasMany( M.Gallery, { as: 'Galleries' } );
        this.hasMany( M.Make,    { as: 'Makes'     } );
        this.hasMany( M.Guide,   { as: 'Guides'    } );
    });
};
