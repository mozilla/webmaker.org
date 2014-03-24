/*global window: false */

var casper = require('casper').create();
var baseURL = 'http://localhost:7777';
var routes = [
  '/',
  '/about',
  '/feedback',
  '/gallery',
  '/getinvolved',
  '/mentor',
  '/party',
  '/privacy',
  '/search',
  '/teach',
  '/terms',
  '/tools'
];

casper.test.begin('No pages throw JS errors.', routes.length, function (test) {
  function errorCheck() {
    var hasError = casper.evaluate(function () {
      return !!window.jsErrorDetected;
    });

    test.assertFalsy(hasError, 'No JS errors detected for: ' + casper.getCurrentUrl());
  }

  casper.start();

  for (var i = 0; i < routes.length; i++) {
    casper.thenOpen(baseURL + routes[i], errorCheck);
  }

  casper.run(function () {
    // test.currentSuite doesn't exist if the suite fails
    // This is kinda hacky, but the API doesn't seem to provide a better way :{
    var suitePassed = !! test.currentSuite;

    test.done();
    this.exit(suitePassed ? 0 : 1);
  });
});
