var
  autoprefixer = require('gulp-autoprefixer'),
  browsersync = require('browser-sync'),
  gulp = require('gulp'),
  imagemin = require('gulp-imagemin'),
  include = require('gulp-include'),
  path = require('path'),
  plumber = require('gulp-plumber'),
  pngquant = require('imagemin-pngquant'),
  pug = require('gulp-pug'),
  pump = require('pump'),
  rename = require('gulp-rename'),
  sass = require('gulp-sass'),
  sassglob = require('gulp-sass-glob'),
  sourcemaps = require('gulp-sourcemaps'),
  uglify = require('gulp-uglify'),
  watch = require('gulp-watch');

// Markup

gulp.task('pug', function() {
  gulp.src([
      'source/!(index)*.pug',
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
    .pipe(browsersync.stream());

  gulp.src('source/index.pug')
    .pipe(plumber())
    .pipe(pug({
      pretty: true,
    }))
    .pipe(gulp.dest('build/'))
    .pipe(browsersync.stream());
});

// Styles

gulp.task('sass', function() {
  gulp.src('source/styles/main.sass')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sassglob())
    .pipe(sass({
      indentedSyntax: true,
      errLogToConsole: true,
      sync: true
    }))
    .pipe(autoprefixer({
      browsers: ['> 1%', 'IE 7'],
      cascade: false
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/assets/styles/'))
    .pipe(browsersync.stream());
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
      gulp.src('scripts/*.js')
      .pipe(uglify()),
      gulp.dest('build/assets/scripts/')
    ],
    cb
  );
});


// Browsersync starts server

gulp.task('server', function() {
  browsersync.init({
    server: {
      baseDir: 'build'
    },
    open: false
  });
});

// Default task watch changes and update on server

gulp.task('default', ['server'], function() {
  gulp.watch(['source/*.pug', 'source/layouts/*.pug', 'source/components/*.pug'], ['pug']);
  gulp.watch(['source/styles/**/*.sass', 'source/components/*.sass'], ['sass']);
  gulp.watch('source/scripts/*.js', ['uglify']);
  gulp.watch('source/images/**/*', ['imagemin']);
});
