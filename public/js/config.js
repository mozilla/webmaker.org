requirejs.config({
  deps: ['main'],
  paths: {
    'jquery': '../ext/js/jquery-1.9.1',
    'jquery-carousel': '../ext/js/jquery.carouFredSel-6.2.1',
    'moment': '../ext/js/moment',
    'uri': '../ext/js/uri'
  },
  shim: {
    'jquery': {
      exports: 'jQuery'
    },
    'jquery-carousel': {
      deps: ['jquery'],
      exports: 'jQuery.fn.carouFredSel'
    }
  }
});
