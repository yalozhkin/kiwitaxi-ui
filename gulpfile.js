var browserSync = require('browser-sync');
var gulp = require('gulp');
var include = require('gulp-include');
var plumber = require('gulp-plumber');
var pug = require('gulp-pug');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');

// Pug builds HTML views

gulp.task('pug', function() {
    gulp.src([
            'source/views/**/*.pug',
            '!source/views/**/_*.pug',
            '!source/views/home/**',
            '!source/views/layouts/**',
            '!source/views/shared/**',
        ])
        .pipe(plumber())
        .pipe(pug({
            pretty: true,
        }))
        .pipe(gulp.dest('build/'))
        .pipe(browserSync.stream());

    gulp.src('source/views/home/*.pug')
        .pipe(plumber())
        .pipe(pug({
            pretty: true,
        }))
        .pipe(gulp.dest('build/'))
        .pipe(browserSync.stream());
});

// SASS builds CSS stylesheet

gulp.task('sass', function() {
    gulp.src([
            'source/styles/*.sass'
        ])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            indentedSyntax: true,
            errLogToConsole: true,
            sync: true
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('build/css/'))
        .pipe(browserSync.stream());
});


// Browsersync server

gulp.task('server', function() {
    browserSync.init({
        server: {
            baseDir: 'build'
        },
        open: false
    });
});

// Default task runs server and watch changes

gulp.task('default', ['server'], function() {
    gulp.watch('source/views/**/*', ['pug']);
    gulp.watch('source/styles/**/*', ['sass']);
});
