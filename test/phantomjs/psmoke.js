/*jshint node: true, browser: true */
/*global phantom: false */

require('colors');
var webpage = require('webpage');
var baseURL = 'http://localhost:7777';
var routes = [
  '/',
  '/about',
  '/events',
  '/feedback',
  '/gallery',
  '/getinvolved',
  '/me',
  '/mentor',
  '/party',
  '/privacy',
  '/search',
  '/literacy',
  '/literacy/building',
  '/literacy/connecting',
  '/literacy/exploring',
  '/starter-makes',
  '/teach',
  '/teach-templates',
  '/terms',
  '/tools'
];

var routeIndex = 0;

function testPage(index) {
  var page = webpage.create();
  var URL = baseURL + routes[index];

  console.log('Testing URL: ' + URL.blue.bold);

  page.open(URL, function (status) {
    var isError = page.evaluate(function () {
      return !!window.jsErrorDetected;
    });

    if (isError) {
      // Exit at the first error
      console.log(('✗ JS error found on ' + URL).red.bold);
      phantom.exit(1);
    } else {
      page.close();
      console.log(('✓'.green.bold) + ' No JS errors detected.');

      if (routeIndex < routes.length - 1) {
        testPage(++routeIndex);
      } else {
        console.log('\nNo errors found!\n'.green.bold);
        phantom.exit(0);
      }
    }
  });
}

testPage(routeIndex);
