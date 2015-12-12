var gulp = require('gulp')
var sass = require('gulp-sass')
var concat = require('gulp-concat')
var jshint = require('gulp-jshint')
var bs = require('browser-sync').create()

// bundling
var browserify = require('browserify')
var buffer = require('vinyl-buffer')
var sourcemaps = require('gulp-sourcemaps')
var gutil = require('gulp-util')
var uglify = require('gulp-uglify')
var source = require('vinyl-source-stream')
var glob = require('glob')
var path = require('path')

gulp.task('init', ['libs'])
gulp.task('build', ['css', 'files', 'js', 'webserver'])
gulp.task('develop', ['build', 'watch'])

gulp.task('watch', ['files', 'js', 'css'], function () {
  gulp.watch(['./common/scss/*.scss', './tests/**/*.scss'], ['css'])
  gulp.watch(['./tests/**/*.{html,png,jpg,jpeg,svg,csv,json,txt}'], ['files'])
  gulp.watch(['./tests/**/*.js'], ['js'])
})

gulp.task('refresh', function () {
  bs.refresh()
})

gulp.task('css', function () {
  gulp.src(['./common/scss/*.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(bs.stream())

  gulp.src(['./tests/**/*.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist'))
    .pipe(bs.stream())
})

gulp.task('js', function () {
  glob('./tests/**/script.js', function (err, files) {
    files.map(function (file) {
      var testName = ''
      var arr = path.join(file, '..').split(path.sep)
      testName = arr[arr.length - 1]

      // Browserify
      var b = browserify({
        entries: file,
        debug: true
      })

      return b.bundle()
        .pipe(source('script.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
            // Add transformation tasks to the pipeline here.
            .pipe(uglify())
            .on('error', gutil.log)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.join('./dist', testName)))
        .pipe(bs.stream())
    })
  })
})



//gulp.task('lint', function() {
//  gulp.src(['./tests/**/script.js'])
//    .pipe(jshint())
//    .pipe(jshint.reporter('jshint-stylish'));
//});



gulp.task('libs', function() {
  gulp.src('common/lib/*.js')
    .pipe(gulp.dest('dist/js'));
});

gulp.task('files', function() {
  return gulp.src(['./tests/**/*.{html,png,jpg,jpeg,svg,csv,json,txt}'])
    .pipe(gulp.dest('./dist'))
    .pipe(bs.stream())
});

gulp.task('webserver', ['files', 'js', 'css'], function() {
    bs.init({
        server: {
            baseDir: "./dist"
        },
        open: false
    });
});
