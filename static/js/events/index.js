require.config({
    deps: ['map/index'],
    paths: {
        'async':        '/ext/js/async',
        'text':         '/ext/js/text',
        'html':         '/js/html',
        'jquery':       '/ext/js/jquery-1.9.1',
        'jquery-ui':    '/ext/js/jquery-ui',
        'jquery.mousewheel': '/ext/js/jquery.mousewheel',
        'globalize':    '/ext/js/globalize',
        'markdown':     '/ext/js/markdown',
        'to-markdown':  '/ext/js/to-markdown',
        'bootstrap-markdown': '/ext/js/bootstrap-markdown',
    },
    shim: {
        'jquery-ui':    ['jquery'],
        'jquery.mousewheel': ['jquery'],
        'globalize': { deps: ['jquery'], exports: 'Globalize' },
        'bootstrap-markdown': ['jquery', 'markdown', 'to-markdown']
    }
});
