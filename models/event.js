module.exports = function (Model, t) {
    Model('Event', {
        title:                              t.String,
        description:                        t.Text,
        address:                            t.String,
        latitude: {
            type:                           t.FLOAT,
            validate: {
                isFloat: true,
                min: -90.0, max: 90.0
            },
            allowNull:      true,
            defaultValue:   null,
        },
        longitude: {
            type:                           t.FLOAT,
            validate: {
                isFloat: true,
                min: -180.0, max: 180.0
            },
            allowNull: true,
            defaultValue: null,
        },
        city:                               t.String,
        country:                            t.String,

        attendees:                          t.Int,
        beginDate:                          t.Date,
        endDate:                            t.Date,
        beginTime:                          t.Date,
        endTime:                            t.Date,
        registerLink:                       t.URL,
        picture:                            t.URL,
        organizer:                          t.Email,
        organizerId:                        t.String,

        featured: {
            type:                           t.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },

        $instanceMethods: {
            uri: function (root) {
                root = root || '/';
                return root + 'events/' + this.id;
            }
        }
    }, function (M) {
        this.hasMany( M.Gallery, { as: 'Galleries' } );
        this.hasMany( M.Make,    { as: 'Makes'     } );
        this.hasMany( M.Guide,   { as: 'Guides'    } );
    });
};
