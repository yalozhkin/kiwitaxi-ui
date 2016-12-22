var
  autoprefixer = require('gulp-autoprefixer'),
  browserSync = require('browser-sync').create(),
  cleanCSS = require('gulp-clean-css'),
  clone = require('gulp-clone'),
  concat = require('gulp-concat'),
  filter = require('gulp-filter'),
  gulp = require('gulp'),
  gulpif = require('gulp-if'),
  gzip = require('gulp-gzip'),
  gzipMiddleware = require('connect-gzip-static')('./build'),
  htmlmin = require('gulp-htmlmin'),
  imagemin = require('gulp-imagemin'),
  imageminMozjpeg = require('imagemin-mozjpeg'),
  imageminOptipng = require('imagemin-optipng'),
  imageminPngquant = require('imagemin-pngquant'),
  imageminSvgo = require('imagemin-svgo'),
  imageminWebp = require('imagemin-webp'),
  include = require('gulp-include'),
  lazypipe = require('lazypipe'),
  mainBowerFiles = require('main-bower-files'),
  newer = require('gulp-newer'),
  path = require('path'),
  plumber = require('gulp-plumber'),
  pug = require('gulp-pug'),
  pump = require('pump'),
  rename = require('gulp-rename'),
  responsive = require('gulp-responsive'),
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
      paths.src.views + '*.pug',
    ])
    .pipe(viewsTasks())
    .pipe(rename(function(file) {
      if (file.basename !== 'home') {
        file.dirname = path.join(file.dirname, file.basename);
      }
      file.basename = 'index';
    }))
    .pipe(gzip())
    .pipe(gulp.dest(paths.dest.root))
    .pipe(browserSync.stream());
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
    .pipe(browserSync.stream());
});

// Images

var rasterOpt = lazypipe()
  .pipe(responsive, {
    'favicon.png': [{
      width: 32,
      rename: {
        suffix: '@2x'
      }
    }, {
      width: 16
    }],
    'cars/*.png': [{
      width: 600,
      withoutEnlargement: false,
      rename: {
        suffix: '@2x'
      }
    }, {
      width: 300
    }],
    'covers/*.png': [{
      width: 1200,
      format: 'jpeg',
      rename: {
        suffix: '@2x',
        extname: '.jpg'
      }
    }, {
      width: 800,
      format: 'jpeg',
      rename: {
        extname: '.jpg'
      }
    }]
  }, {
    errorOnEnlargement: false,
    errorOnUnusedConfig: false,
    errorOnUnusedImage: false,
    passThroughUnused: true,
    withMetadata: false
  })
  .pipe(imagemin, {
    use: [
      imageminPngquant(),
      imageminWebp(),
      imageminMozjpeg()
    ]
  });

var vectorOpt = lazypipe()
  .pipe(imagemin, {
    use: imageminSvgo({
      plugins: [{
        removeViewBox: false
      }]
    })
  })
  .pipe(gzip);

gulp.task('img', function() {
  var sink = clone.sink();
  gulp.src(paths.src.images + '**/*.{svg,png,jpg}')
    .pipe(newer(paths.dest.images + '**/*'))
    .pipe(plumber())
    .pipe(gulpif('*.svg', vectorOpt(), rasterOpt()))
    .pipe(sink)
    .pipe(webp())
    .pipe(sink.tap())
    .pipe(gulp.dest(paths.dest.images))
    .pipe(browserSync.stream());
});

// Scripts

gulp.task('js', function() {
  gulp.src(mainBowerFiles('**/*.js'))
    .pipe(uglify())
    .pipe(gzip())
    .pipe(gulp.dest(paths.dest.scripts))
    .pipe(browserSync.stream());
});

// Build

gulp.task('build', ['pug', 'sass', 'js', 'img']);

// Server

gulp.task('server', function() {
  browserSync.init({
      server: {
        baseDir: paths.dest.root
      },
      open: false,
    },
    function(err, bs) {
      bs.addMiddleware('*', gzipMiddleware, {
        override: true
      });
    });
});

// Default

gulp.task('default', ['server'], function() {
  gulp.watch([paths.src.views + '**/*.pug', paths.src.data + '*.pug'], ['pug']);
  gulp.watch([paths.src.styles + '**/**/*.sass', paths.src.views + 'components/*.sass'], ['sass']);
  gulp.watch(paths.src.scripts + '*.js', ['js']);
  gulp.watch(paths.src.images + '**/*', ['img']);
});
