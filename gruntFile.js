module.exports = function (grunt) {
  'use strict';

  // Load all grunt tasks matching the `grunt-*` pattern.
  require('load-grunt-tasks')(grunt);

  // Task.
  grunt.registerTask('default', ['jshint', 'karma:unit_jqlite', 'karma:unit_jquery', 'dist']);
  grunt.registerTask('serve', ['connect:continuous', 'karma:continuous_jquery',  'karma:continuous_jqlite', 'watch']);
  grunt.registerTask('dist', ['copy', 'uglify']);


  var testConfig = function (configFile, customOptions) {
    var options = { configFile: configFile, singleRun: true };
    var travisOptions = process.env.TRAVIS && { browsers: [ 'Firefox', 'PhantomJS'], reporters: ['dots'] };
    return grunt.util._.extend(options, customOptions, travisOptions);
  };

  var files = [
    'bower_components/jquery/jquery.js',
    'test/jquery_remove.js',
    'test/browserTrigger.js',
    'bower_components/angular/angular.js',
    'bower_components/angular-mocks/angular-mocks.js',
    'src/*',
    'test/*.spec.js'
    ];

  var filesJquery = [
    'bower_components/jquery/jquery.js',
    'test/jquery_remove.js',
  ].concat(files);

  var filesJqlite = [
    'bower_components/jquery/jquery.js',
    'test/jquery_remove.js',
  ].concat(files);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    mainFileName: 'ui-slider',
    meta: {
      banner: ['/**',
        ' * <%= pkg.name %> - <%= pkg.description %>',
        ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
        ' * @link <%= pkg.homepage %>',
        ' * @license <%= pkg.license %>',
        ' */',
        ''].join('\n')
    },

    connect: {
      options: {
        port: grunt.option('port') || '8888',
        hostname: grunt.option('host') || 'localhost',
        open: 'http://<%= connect.options.hostname %>:<%= connect.options.port %>/demo/demo.html',
        livereload: true
      },
      server: { options: { keepalive: true } },
      continuous: { options: { keepalive: false } }
    },

    // TESTER
    // =======
    karma: {
      unit_jquery: testConfig('test/karma.conf.js', {
        port: 9876, singleRun: true,
        options: { files: filesJquery }
      }),
      unit_jqlite:  testConfig('test/karma.conf.js', {
        port: 5432, singleRun: true,
        options: { files: filesJqlite }
      }),

      continuous_jquery: {
        configFile: 'test/karma.conf.js',
        port: 9876, background: true,
        options: { files: filesJquery }
      },
      continuous_jqlite: {
        configFile: 'test/karma.conf.js',
        port: 5432, background: true,
        options: { files: filesJqlite }
      }
    },


    // WATCHER
    // =======
    watch: {
      options: {
        livereload: true
      },
      test: {
        files: ['src/*', 'test/*.js'],
        tasks: ['jshint', 'karma:unit_jqlite:run', 'karma:unit_jquery:run']
      },
      src: {
        files: ['src/*'],
        tasks: ['dist']
      },
      demo: {
        files: ['demo/*']
      }
    },


    // CODE QUALITY
    // ============
    jshint: {
      all: ['src/*.js', 'gruntFile.js', 'demo/*.js'],
      options: { jshintrc: '.jshintrc' }
    },

    // MINIFIER
    // ========
    uglify: {
      //options: {banner: '<%= meta.banner %>'},
      build: {
        files: {
          'dist/<%= mainFileName %>.min.js': ['src/<%= mainFileName %>.js']
        }
      }
    },

    copy: {
      build: {
        files: {
          'dist/<%= mainFileName %>.js': ['src/<%= mainFileName %>.js'],
          'dist/<%= mainFileName %>.css': ['src/<%= mainFileName %>.css']
        }
      }
    }
  });

};
