    require.config({
    deps: ['main', 'jquery.css3finalize', 'bootstrap-markdown',
            'jquery.timepicker', 'jquery-ui.custom', 'jquery.validate',
            'additional-methods'],
    paths: {
        'html':                 '/js/html',
        'base':                 '/js/base',
        'main':                 '/js/main',
        'async':                '/ext/js/async',
        'text':                 '/ext/js/text',
        'domReady':             '/ext/js/domReady',

        'jquery':               '/ext/js/jquery',
        'jquery-ui.custom':     '/ext/js/jquery-ui-1.10.3.custom',
        'jquery.timepicker':    '/ext/js/jquery.timepicker',
        'jquery.validate':      '/ext/js/jquery.validate',
        'additional-methods':   '/ext/js/additional-methods',
        'jquery.css3finalize':  '/ext/js/jquery.css3finalize-v3.x.min',
        'rails':                '/ext/js/rails',

        'localized':            '/bower/localized/localized',

        'oms':                  '/ext/js/oms',
        'infobubble':           '/ext/js/infobubble',
        'google':               'map/google',
        'markerclusterer':      'map/markerclusterer',

        'markdown':             '/ext/js/markdown',
        'to-markdown':          '/ext/js/to-markdown',
        'bootstrap-markdown':   '/ext/js/bootstrap-markdown',

    },
    shim: {
        'jquery-ui.custom':     ['jquery'],
        'jquery.css3finalize':  ['jquery'],
        'bootstrap-markdown':   ['jquery', 'markdown', 'to-markdown'],
        'jquery.validate':      ['jquery'],
        'rails':                ['jquery'],
        'additional-methods':   ['jquery.validate'],
    },
    callback: function () {
        require(['jquery'], function ($) {
            var page = $('body').attr('class').split(/\s+/)[0];
            require(['./'+page+'/index']);
        });
    },
    waitSeconds: 0
});
