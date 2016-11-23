var
  autoprefixer = require('gulp-autoprefixer'),
  browserSync = require('browser-sync'),
  gulp = require('gulp'),
  imagemin = require('gulp-imagemin'),
  include = require('gulp-include'),
  plumber = require('gulp-plumber'),
  pngquant = require('imagemin-pngquant'),
  pug = require('gulp-pug'),
  pump = require('pump'),
  rename = require('gulp-rename'),
  sass = require('gulp-sass'),
  sassGlob = require('gulp-sass-glob'),
  uglify = require('gulp-uglify'),
  watch = require('gulp-watch'),
  path = require('path');

// Views

gulp.task('pug', function() {
  gulp.src([
      'source/views/*.pug',
      '!source/views/index.pug',
      '!source/views/layouts/*.pug',
      '!source/views/shared/*.pug'
    ])
    .pipe(plumber())
    .pipe(pug({
      pretty: true,
    }))
    .pipe(rename(function(file) {
      file.dirname = path.join(file.dirname, file.basename);
      file.basename = 'index';
      file.extname = '.html';
    }))
    .pipe(gulp.dest('build/'))
    .pipe(browserSync.stream());

  gulp.src('source/views/index.pug')
    .pipe(plumber())
    .pipe(pug({
      pretty: true,
    }))
    .pipe(gulp.dest('build/'))
    .pipe(browserSync.stream());
});

// Styles

gulp.task('sass', function() {
  gulp.src('source/styles/main.scss')
    .pipe(plumber())
    .pipe(sassGlob())
    .pipe(sass({
      includePaths: require('node-normalize-scss').includePaths,
      indentedSyntax: true,
      errLogToConsole: true,
      sync: true
    }))
    .pipe(gulp.dest('build/assets/styles/'))
    .pipe(browserSync.stream());
});

// Images

gulp.task('imagemin', function() {
  gulp.src('source/images/**/*')
    .pipe(plumber())
    .pipe(imagemin({
      progressive: true,
      use: [pngquant()]
    }))
    .pipe(gulp.dest('build/assets/images/'));
});

// Javascript

gulp.task('uglify', function(cb) {
  pump([
      gulp.src('scripts/*')
      .pipe(uglify()),
      gulp.dest('build/assets/scripts/')
    ],
    cb
  );
});


// Browsersync starts server

gulp.task('server', function() {
  browserSync.init({
    server: {
      baseDir: 'build'
    },
    open: false
  });
});

// Default task watch changes and update on server

gulp.task('default', ['server'], function() {
  gulp.watch('source/views/**/*', ['pug']);
  gulp.watch('source/styles/**/*', ['sass']);
  gulp.watch('source/scripts/**/*', ['uglify']);
  gulp.watch('source/images/**/*', ['imagemin']);
});
