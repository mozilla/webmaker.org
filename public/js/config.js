requirejs.config({
  deps: ['main'],
  paths: {
    'jquery': '../ext/js/jquery-1.9.1',
    'moment': '../ext/js/moment',
    'uri': '../ext/js/uri'
  },
  shim: {
    'jquery': {
      exports: 'jQuery'
    }
  }
});
