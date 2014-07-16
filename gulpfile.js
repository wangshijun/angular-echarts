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
    var appJs = gulp.src('src/*.js')
        .pipe(plugins.concat('angular-echarts.js'))
        .pipe(plugins.removeUseStrict())
        .pipe(plugins.uglify({ outSourceMap: true, mangle: true, report: 'gzip' }))
        .pipe(plugins.size({ showFiles: true }))
        .pipe(gulp.dest('dist'))

    // bump bower, npm versions
    gulp.src(['package.json', 'bower.json'])
        .pipe(plugins.bump())
        .pipe(gulp.dest('.'));

});

