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

var paths = {
  src: {
    root: './source/',
    data: './source/data/',
    images: './source/images/',
    scripts: './source/scripts/',
    styles: './source/styles/',
    views: './source/views/'
  },
  dest: {
    root: './build/',
    images: './build/assets/images/',
    scripts: './build/assets/scripts/',
    styles: './build/assets/styles/',
  }
};

// Views
gulp.task('pug', function() {
  gulp.src([
      paths.src.views + '!(home)*.pug',
    ])
    .pipe(plumber())
    .pipe(pug({
      pretty: true
    }))
    .pipe(rename(function(file) {
      file.dirname = path.join(file.dirname, file.basename);
      file.basename = 'index';
      file.extname = '.html';
    }))
    .pipe(gulp.dest(paths.dest.root))
    .pipe(browsersync.stream());

  gulp.src(paths.src.views + 'home.pug')
    .pipe(plumber())
    .pipe(pug({
      pretty: true
    }))
    .pipe(rename(function(file) {
      file.basename = 'index';
      file.extname = '.html';
    }))
    .pipe(gulp.dest(paths.dest.root))
    .pipe(browsersync.stream());
});

// Styles
gulp.task('sass', function() {
  gulp.src(paths.src.styles + 'main.sass')
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
    .pipe(gulp.dest(paths.dest.styles))
    .pipe(browsersync.stream());
});

// Images
gulp.task('imagemin', function() {
  gulp.src(paths.src.images + '**/*')
    .pipe(plumber())
    .pipe(imagemin({
      progressive: true,
      use: [pngquant()]
    }))
    .pipe(gulp.dest(paths.dest.images));
});

// Scripts
gulp.task('uglify', function(cb) {
  pump([
      gulp.src(paths.src.scripts + '*.js')
      .pipe(uglify()),
      gulp.dest(paths.dest.scripts)
    ],
    cb
  );
});

// Build
gulp.task('build', ['pug', 'sass', 'uglify', 'imagemin']);

// Browsersync
gulp.task('server', function() {
  browsersync.init({
    server: {
      baseDir: paths.dest.root
    },
    open: false
  });
});

// Default task
gulp.task('default', ['server'], function() {
  gulp.watch([paths.src.views + '**/*.pug', paths.src.data + '*.pug'], ['pug']);
  gulp.watch([paths.src.styles + '**/**/*.sass', paths.src.views + 'blocks/*.sass'], ['sass']);
  gulp.watch(paths.src.scripts + '*.js', ['uglify']);
  gulp.watch(paths.src.images + '**/*', ['imagemin']);
});
