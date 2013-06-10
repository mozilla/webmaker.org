require.config({
    deps: ['main', 'jquery.css3finalize', 'jquery-ui.datepicker', 'bootstrap-markdown'],
    paths: {
        'html':                 '/js/html',
        'base':                 '/js/base',
        'main':                 '/js/main',
        'async':                '/ext/js/async',
        'text':                 '/ext/js/text',
        'domReady':             '/ext/js/domReady',
        'jquery':               '/ext/js/jquery-1.9.1',
        'markdown':             '/ext/js/markdown',
        'to-markdown':          '/ext/js/to-markdown',
        'jquery-ui.datepicker': '/ext/js/jquery-ui-1.10.3.datepicker-custom',
        'jquery.timepicker':    '/ext/js/jquery.timepicker',
        'bootstrap-markdown':   '/ext/js/bootstrap-markdown',
        'jquery.css3finalize':  '/ext/js/jquery.css3finalize-v3.x.min',
    },
    shim: {
        'jquery-ui.datepicker': ['jquery'],
        'jquery.css3finalize':  ['jquery'],
        'bootstrap-markdown':   ['jquery', 'markdown', 'to-markdown']
    },
    callback: function () {
        require(['jquery'], function ($) {
            var page = $('body').attr('class').split(/\s+/)[0];
            require(['./'+page+'/index']);
        });
    }
});
