module.exports = function (grunt) {
  // Node and client side JS have slightly different JSHint directives
  // We'll create 2 versions with .jshintrc as a baseline
  var browserJSHint = grunt.file.readJSON('.jshintrc');
  var nodeJSHint = grunt.file.readJSON('.jshintrc');

  // Don't throw errors for expected Node globals
  nodeJSHint.node = true;

  // Don't throw errors for expected browser globals
  browserJSHint.browser = true;

  var clientSideJS = [
    'public/js/**/*.js',
    '!public/js/lib/**'
  ];

  var nodeJS = [
    'Gruntfile.js',
    'app.js',
    'lib/**/*.js',
    '!lib/events/**',
    'routes/**/*.js',
    'test/casperjs/**/*.js'
  ];

  var allJS = clientSideJS.concat(nodeJS);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    recess: {
      dist: {
        options: {
          noIDs: false,
          noOverqualifying: false,
          noUniversalSelectors: false,
          zeroUnits: false,
          strictPropertyOrder: false
        },
        src: [
          'public/css/style.less',
          'public/css/make-details.less'
        ]
      }
    },
    jsbeautifier: {
      modify: {
        src: allJS,
        options: {
          config: '.jsbeautifyrc'
        }
      },
      verify: {
        src: allJS,
        options: {
          mode: 'VERIFY_ONLY',
          config: '.jsbeautifyrc'
        }
      }
    },
    jshint: {
      browser: {
        src: clientSideJS,
        options: browserJSHint
      },
      node: {
        src: nodeJS,
        options: nodeJSHint
      }
    },
    imagemin: {
      options: {
        optimizationLevel: 7,
        pngquant: false
      },
      primary: {
        files: [{
          expand: true,
          cwd: "public/img/",
          src: ["**/*.{png,jpg,gif}"],
          dest: "public/img/"
        }]
      },
      events: {
        files: [{
          expand: true,
          cwd: "public/events/img/",
          src: ["**/*.{png,jpg,gif}"],
          dest: "public/events/img/"
        }]
      }
    },
    casperjs: {
      options: {},
      files: ['test/casperjs/**/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-casperjs');
  grunt.loadNpmTasks('grunt-recess');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-imagemin');

  // Clean & verify code (Run before commit)
  grunt.registerTask('default', ['recess', 'jsbeautifier:modify', 'jshint', 'imagemin']);

  // Verify code (Read only)
  grunt.registerTask('validate', ['recess', 'jsbeautifier:verify', 'jshint']);

};
