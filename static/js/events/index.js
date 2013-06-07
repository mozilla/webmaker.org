require.config({
    deps: ['map/index'],
    paths: {
        'html':         '/js/html',
        'async':        '/ext/js/async',
        'text':         '/ext/js/text',
        'jquery':       '/ext/js/jquery-1.9.1',
        'jquery-ui':    '/ext/js/jquery-ui',
        'jquery.form':  '/ext/js/jquery.form',
        'globalize':    '/ext/js/globalize',
        'markdown':     '/ext/js/markdown',
        'to-markdown':  '/ext/js/to-markdown',
        'jquery.mousewheel':    '/ext/js/jquery.mousewheel',
        'bootstrap-markdown':   '/ext/js/bootstrap-markdown',
    },
    shim: {
        'jquery.form':  ['jquery'],
        'jquery-ui':    ['jquery'],
        'jquery.mousewheel': ['jquery'],
        'globalize': { deps: ['jquery'], exports: 'Globalize' },
        'bootstrap-markdown': ['jquery', 'markdown', 'to-markdown']
    }
});
