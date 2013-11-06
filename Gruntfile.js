module.exports = function (grunt) {
  var jsPatterns = [
    'Gruntfile.js',
    'app.js',
    'lib/**/*.js',
    'public/js/**/*.js',
    '!public/js/lib/**',
    '!lib/events/**',
    'routes/**/*.js'
  ];

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
        src: jsPatterns,
        options: {
          config: '.jsbeautifyrc'
        }
      },
      verify: {
        src: jsPatterns,
        options: {
          mode: 'VERIFY_ONLY',
          config: '.jsbeautifyrc'
        }
      }
    },
    jshint: {
      all: jsPatterns,
      options: {
        jshintrc: '.jshintrc'
      }
    }
  });

  grunt.loadNpmTasks('grunt-recess');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['recess', 'jshint']);
};
