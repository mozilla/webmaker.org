module.exports = function( grunt ) {
  grunt.initConfig({
    pkg: grunt.file.readJSON( "package.json" ),

    recess: {
      dist: {
        options: {
          noIDs: false,
          noOverqualifying: false,
          noUniversalSelectors: false,
          strictPropertyOrder: false
        },
        src: [
          "public/css/style.less",
          "public/css/make-details.less"
        ]
      }
    },
    jshint: {
      files: [
        "Gruntfile.js",
        "app.js",
        "lib/**/*.js",
        "package.json",
        "public/js/**/*.js",
        "!public/js/lib/**",
        "!lib/events/**",
        "routes/**/*.js"
      ]
    }
  });

  grunt.loadNpmTasks( "grunt-recess" );
  grunt.loadNpmTasks( "grunt-contrib-jshint" );

  grunt.registerTask( "default", [ "recess", "jshint" ]);
};
