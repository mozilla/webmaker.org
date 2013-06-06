require.config({
    deps: ['map/index'],
    paths: {
        'async':        '/ext/js/async',
        'text':         '/ext/js/text',
        'html':         '/js/html',
        'jquery':       '/ext/js/jquery-1.9.1',
        'jquery-ui':    '/ext/js/jquery-ui',
        'globalize':    '/ext/js/globalize',
        'jquery.mousewheel': '/ext/js/jquery.mousewheel',
    },
    shim: {
        'jquery-ui':    ['jquery'],
        'jquery.mousewheel': ['jquery'],
        'globalize': {
            deps: ['jquery'],
            init: function () { return window.Globalize; }
        },
    }
});
