module.exports = function (C, app) {
    function route(method, path, action) {
        app[method.toLowerCase()](path + '.:_format?', action);
    }

    // Admin Interface
    route( 'GET',    '/events/admin',     C.Events.admin   );
    route( 'GET',    '/events/metrics',   C.Events.metrics );

    route( 'GET',    '/events',           C.Events.index   );
    route( 'GET',    '/events/:id',       C.Events.details );
    route( 'POST',   '/events',           C.Events.create  );
    route( 'PATCH',  '/events/:id',       C.Events.change  );
    //route( 'PUT',    '/events/:id',       C.Events.update  );
    route( 'DELETE', '/events/:id',       C.Events.destroy );
};
