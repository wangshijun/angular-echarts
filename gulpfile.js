'use strict';

var gulp    = require('gulp');
var plugins = require('gulp-load-plugins')();

/**
 * build Tasks
 */
gulp.task('build', function () {

    // cleanup previous builds
    gulp.src('dist/*.js', {read: false})
        .pipe(plugins.clean());

    // build js
    gulp.src(['src/directive.js', 'src/util.js', 'src/theme.js', 'src/theme/*.js'])
        .pipe(plugins.concat('angular-echarts.js'))
        .pipe(plugins.wrap('(function () {<%= contents %>})();'))
        .pipe(gulp.dest('dist'))
        .pipe(plugins.rename({ suffix: '.min'}))
        .pipe(plugins.uglify({ outSourceMap: true, mangle: true, report: 'gzip' }))
        .pipe(plugins.size({ showFiles: true }))
        .pipe(gulp.dest('dist'));

});

/**
 * publish: build then bump version
 */
gulp.task('publish', ['build'], function () {

    // bump bower, npm versions
    gulp.src(['package.json', 'bower.json'])
        .pipe(plugins.bump())
        .pipe(gulp.dest('.'));

});

