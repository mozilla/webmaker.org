/*
 * Part of this code is taken from AngularJS Localization Service by Jim Lavin
 */

angular.module('localization', ['ngSanitize'])
// localization service responsible for retrieving resource files from the server and
// managing the translation dictionary
.factory('localize', ['$http', '$rootScope', 'CONFIG',
  function ($http, $rootScope, config) {
    var localize = {
      // Object to hold the localized resource string entries
      dictionary: {},
      // location of the resource file
      url: undefined,
      // flag to indicate if the service has loaded the resource file
      resourceFileLoaded: false,

      // success handler for all server communication
      successCallback: function (data) {
        // store the returned array in the dictionary
        localize.dictionary = data;
        // set the flag that the resource are loaded
        localize.resourceFileLoaded = true;
        // broadcast that the file has been loaded
        $rootScope.$broadcast('localizeResourcesUpdated');
      },

      // builds the url for locating the resource file
      buildUrl: function () {
        return '/strings/' + config.lang;
      },

      // loads the language resource file from the server
      initLocalizedResources: function () {
        // build the url to retrieve the localized resource file
        var url = localize.url || localize.buildUrl();
        // request the resource file
        $http({
          method: 'GET',
          url: url,
          cache: false
        }).success(localize.successCallback).error(function () {
          // the request failed set the url to the default resource file
          var url = '/strings/en-US';
          // request the default resource file
          $http({
            method: 'GET',
            url: url,
            cache: false
          }).success(localize.successCallback);
        });
      },

      // checks the dictionary for a localized resource string
      getLocalizedString: function (value) {
        if (localize.resourceFileLoaded) {
          if (localize.dictionary.hasOwnProperty(value)) {
            return localize.dictionary[value];
          } else {
            return 'unknown key: "' + value + '"';
          }
        }
      }
    };

    // force the load of the resource file
    localize.initLocalizedResources();

    // return the local instance when called
    return localize;
  }
])
// simple translation filter
// usage {{ TOKEN | i18n }}
.filter('i18n', ['localize',
  function (localize) {
    return function (input) {
      return localize.getLocalizedString(input);
    };
  }
])
// translation directive that can handle dynamic strings
// updates the text value of the attached element
// usage <span i18n="TOKEN" ></span>
// or
// <span i18n="TOKEN|VALUE1|VALUE2" ></span>
.directive('i18n', ['localize',
  function (localize) {
    var i18nDirective = {
      restrict: 'A',
      updateText: function (elm, token) {
        var values = token.split('|');
        if (values.length >= 1) {
          // construct the tag to insert into the element
          var tag = localize.getLocalizedString(values[0]);
          // update the element only if data was returned
          if ((tag !== null) && (tag !== undefined) && (tag !== '')) {
            if (values.length > 1) {
              for (var index = 1; index < values.length; index++) {
                var target = '{' + (index - 1) + '}';
                tag = tag.replace(target, values[index]);
              }
            }
            // insert the text into the element
            elm.text(tag);
          }
        }
      },

      link: function (scope, elm, attrs) {
        scope.$on('localizeResourcesUpdated', function () {
          i18nDirective.updateText(elm, attrs.i18n);
        });

        attrs.$observe('i18n', function (value) {
          i18nDirective.updateText(elm, attrs.i18n);
        });
      }
    };

    return i18nDirective;
  }
])
  .directive('bindUnsafeHtml', ['$compile',
    function ($compile) {
      return function (scope, element, attrs) {
        scope.$watch(
          function (scope) {
            // watch the 'bindUnsafeHtml' expression for changes
            return scope.$eval(attrs.bindUnsafeHtml);
          },
          function (value) {
            // when the 'bindUnsafeHtml' expression changes
            // assign it into the current DOM
            element.html(value);

            // compile the new DOM and link it to the current
            // scope.
            // NOTE: we only compile .childNodes so that
            // we don't get into infinite loop compiling ourselves
            $compile(element.contents())(scope);
          }
        );
      };
    }
  ])
// translation directive that can handle dynamic strings
// updates the attribute value of the attached element
// usage <span i18n-attr="TOKEN|ATTRIBUTE" ></span>
// or
// <span i18n-attr="TOKEN|ATTRIBUTE|VALUE1|VALUE2" ></span>
.directive('i18nAttr', ['localize',
  function (localize) {
    var i18NAttrDirective = {
      restrict: 'A',
      updateText: function (elm, token) {
        var values = token.split('|');
        // construct the tag to insert into the element
        var tag = localize.getLocalizedString(values[0]);
        // update the element only if data was returned
        if ((tag !== null) && (tag !== undefined) && (tag !== '')) {
          if (values.length > 2) {
            for (var index = 2; index < values.length; index++) {
              var target = '{' + (index - 2) + '}';
              tag = tag.replace(target, values[index]);
            }
          }
          // insert the text into the element
          elm.attr(values[1], tag);
        }
      },
      link: function (scope, elm, attrs) {
        scope.$on('localizeResourcesUpdated', function () {
          i18NAttrDirective.updateText(elm, attrs.i18nAttr);
        });

        attrs.$observe('i18nAttr', function (value) {
          i18NAttrDirective.updateText(elm, value);
        });
      }
    };

    return i18NAttrDirective;
  }
]);
