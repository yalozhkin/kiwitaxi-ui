var
  autoprefixer = require('gulp-autoprefixer'),
  browsersync = require('browser-sync'),
  cleanCSS = require('gulp-clean-css'),
  clone = require('gulp-clone'),
  concat = require('gulp-concat'),
  filter = require('gulp-filter'),
  gulp = require('gulp'),
  gzipMiddleware = require('connect-gzip-static')('./build'),
  gulpif = require('gulp-if'),
  gzip = require('gulp-gzip'),
  htmlmin = require('gulp-htmlmin'),
  imagemin = require('gulp-imagemin'),
  imageminWebp = require('imagemin-webp'),
  imageminSvgo = require('imagemin-svgo'),
  imageminMozjpeg = require('imagemin-mozjpeg'),
  include = require('gulp-include'),
  lazypipe = require('lazypipe'),
  mainBowerFiles = require('main-bower-files'),
  newer = require('gulp-newer'),
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
  watch = require('gulp-watch'),
  webp = require('gulp-webp');

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

var viewsTasks = lazypipe()
  .pipe(plumber)
  .pipe(pug, {
    pretty: true
  })
  .pipe(htmlmin, {
    collapseWhitespace: true
  });

gulp.task('pug', function() {
  gulp.src([
      paths.src.views + '!(home)*.pug',
    ])
    .pipe(viewsTasks())
    .pipe(rename(function(file) {
      file.dirname = path.join(file.dirname, file.basename);
      file.basename = 'index';
      file.extname = '.html';
    }))
    .pipe(gzip())
    .pipe(gulp.dest(paths.dest.root))
    .pipe(browsersync.stream());

  gulp.src(paths.src.views + 'home.pug')
    .pipe(viewsTasks())
    .pipe(rename(function(file) {
      file.basename = 'index';
      file.extname = '.html';
    }))
    .pipe(gzip())
    .pipe(gulp.dest(paths.dest.root))
    .pipe(browsersync.stream());
});

// Styles
gulp.task('sass', function() {
  gulp.src(paths.src.styles + '*.sass')
    .pipe(plumber())
    .pipe(newer(paths.dest.styles))
    .pipe(sourcemaps.init())
    .pipe(sassglob())
    .pipe(sass({
      indentedSyntax: true,
      errLogToConsole: true,
      sync: true
    }))
    .pipe(autoprefixer({
      browsers: ['> 1%', 'IE 8'],
      cascade: false
    }))
    .pipe(cleanCSS({
      compatibility: 'ie8'
    }))
    .pipe(gzip())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.dest.styles))
    .pipe(browsersync.stream());
});

// Images

var rasterOpt = lazypipe()
  .pipe(imagemin, {
    use: [
      pngquant(),
      imageminWebp(),
      imageminMozjpeg()
    ],
    lossless: true
  });

var vectorOpt = lazypipe()
  .pipe(imagemin, {
    use: imageminSvgo({
      plugins: [{
        removeViewBox: false
      }]
    }),
    lossless: true
  })
  .pipe(gzip);

gulp.task('img', function() {
  var sink = clone.sink();

  gulp.src(paths.src.images + '**/*')
    .pipe(plumber())
    .pipe(sink)
    .pipe(webp())
    .pipe(sink.tap())
    .pipe(newer(paths.dest.images + '**/*'))
    .pipe(gulpif('*.svg', vectorOpt(), rasterOpt()))
    .pipe(gulp.dest(paths.dest.images));
});

// Scripts

gulp.task('js', function() {
  gulp.src(mainBowerFiles('**/*.js'))
    .pipe(uglify())
    .pipe(gzip())
    .pipe(gulp.dest(paths.dest.scripts));
});

// Build
gulp.task('build', ['pug', 'sass', 'js', 'img']);

// Browsersync

gulp.task('server', function() {
  browsersync.init({
    server: {
      baseDir: paths.dest.root
    },
    open: false,
    files: [
      paths.dest.root + '**/*.html',
      paths.dest.styles + '*.css',
      paths.dest.scripts + '*.js',
      paths.dest.images + '**/*',
    ]
  }, function(err, bs) {
    bs.addMiddleware('*', gzipMiddleware, {
      override: true
    });
  });
});

// Default task
gulp.task('default', ['server'], function() {
  gulp.watch([paths.src.views + '**/*.pug', paths.src.data + '*.pug'], ['pug']);
  gulp.watch([paths.src.styles + '**/**/*.sass', paths.src.views + 'blocks/*.sass'], ['sass']);
  gulp.watch(paths.src.scripts + '*.js', ['js']);
  gulp.watch(paths.src.images + '**/*', ['img', 'responsive']);
});
