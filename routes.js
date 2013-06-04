module.exports = function (C) {
    this.use('/events', function (req, res, next) {
        res.locals( { makeEndpoint : process.env.MAKE_ENDPOINT
                    , personaSSO   : process.env.AUDIENCE
                    , loginAPI     : process.env.LOGIN
                    , email        : req.session.email || ''
                    , webmakerID   : req.session.webmakerid || '' });
        next();
    }.bind(this));

    this.get('/events.:format?',     C.Events.index);
    this.get('/events/:id.:format?', C.Events.details);
    this.post('/events.:format?',    C.Events.create);
    //this.put('/events/:id.:format?', C.Events.update);
    //this.delete('/events/:id.:format?', C.Events.destroy);
};
