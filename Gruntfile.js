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
    'routes/**/*.js',
    'test/**/*.js'
  ];

  var allJS = clientSideJS.concat(nodeJS);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
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
    gettext_finder: {
      files: ["views/*.html", "views/**/*.html"],
      options: {
        pathToJSON: ["locale/en_US/*.json"],
        ignoreKeys: grunt.file.readJSON("gtf-ignored-keys.json")
      },
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
      }
    },
    uglify: {
      dependencies: {
        options: {
          sourceMap: true
        },
        files: {
          'public_angular/compiled/dependencies.min.js': [
            'bower_components/jquery/jquery.js',
            'bower_components/web-literacy-client/dist/web-literacy-client.with-langs.js',
            'bower_components/makeapi-client/src/make-api.js',
            'bower_components/webmaker-auth-client/dist/webmaker-auth-client.min.js',
            'bower_components/masonry/dist/masonry.pkgd.js',

            'bower_components/angular/angular.js',
            'bower_components/angular-bootstrap/ui-bootstrap.js',
            'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'bower_components/angular-resource/angular-resource.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/angular-sanitize/angular-sanitize.js'
          ],
        },
      },
      app: {
        options: {
          sourceMap: true
        },
        files: {
          'public_angular/compiled/app.min.js': ['public_angular/js/**/*.js']
        },
      },
    },

    watch: {
      angular: {
        files: ['public_angular/js/**/*.js'],
        tasks: ['uglify'],
        options: {
          spawn: false
        }
      },
      node: {
        files: ['routes/**/*.js', 'lib/**/*.js', 'app.js', 'less/**/*', 'locale/**/*.json'],
        tasks: ['express:dev'],
        options: {
          spawn: false
        }
      }
    },

    express: {
      dev: {
        options: {
          script: 'app.js',
          node_env: 'DEV',
          port: ''
        }
      }
    },

    shell: {
      smokeTest: {
        options: {
          stdout: true,
          failOnError: true
        },
        command: 'phantomjs test/phantomjs/psmoke.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-gettext-finder');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // For building angular js
  grunt.registerTask('build', ['uglify']);

  grunt.registerTask('dev', ['express', 'watch']);

  // Clean & verify code (Run before commit)
  grunt.registerTask('default', ['jsbeautifier:modify', 'jshint', 'imagemin']);

  // Verify code (Read only)
  grunt.registerTask('validate', ['jsbeautifier:verify', 'jshint', 'gettext_finder']);

  // Run through all pages and test for JS errors
  // * Requires global install of PhantomJS *
  grunt.registerTask('smoke', 'shell:smokeTest');

};
