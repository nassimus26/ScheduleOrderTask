// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    files: ['tests/*.js'],
    preprocessors: {
        'tests/*.js': [ 'browserify' ]
    },
    basePath: '',
    frameworks: ['jasmine', 'browserify'],
    plugins: ['karma-jasmine',
              'karma-chrome-launcher',
              'karma-jasmine-html-reporter',
              'karma-coverage-istanbul-reporter',
              'karma-browserify'
    ],
    client:{
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      reports: [ 'html', 'lcovonly' ],
      fixWebpackSourcePaths: true
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false
  });
};
