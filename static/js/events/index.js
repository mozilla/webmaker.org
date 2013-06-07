require.config({
  deps: ['map/index'],
  paths: {
    'jquery':   '/ext/js/jquery-1.9.1',
    'async':    '/ext/js/async',
    'markdown': '/ext/js/markdown',
    'to-markdown': '/ext/js/to-markdown',
    'bootstrap-markdown': '/ext/js/bootstrap-markdown',
  },
  shim: {
    'bootstrap-markdown': ['jquery', 'markdown', 'to-markdown'],
  },
});
