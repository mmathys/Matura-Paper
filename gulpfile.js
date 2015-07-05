var gulp = require('gulp');
var sass = require('gulp-sass');
var server = require('gulp-server-livereload');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');

gulp.task('init', ['libs']);
gulp.task('build', ['css', 'files', 'lint', 'webserver']);
gulp.task('develop', ['build', 'watch']);

gulp.task('watch', function() {
  gulp.watch(['./common/scss/*.scss', './tests/**/*.scss'], ['css']);
  gulp.watch(['./tests/**/*.{html,js,png,jpg,jpeg,svg,csv,json,txt}'], ['files']);
  gulp.watch(['./tests/**/*.js'], ['lint']);
});

gulp.task('css', function() {
  gulp.src(['./common/scss/*.scss', './tests/**/*.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('lint', function() {
  gulp.src(['./tests/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('libs', function() {
  gulp.src('common/lib/*.js')
  .pipe(gulp.dest('dist/js'));
});

gulp.task('files', function() {
  gulp.src(['./tests/**/*.{html,js,png,jpg,jpeg,svg,csv,json,txt}'])
    .pipe(gulp.dest('./dist'));
});

gulp.task('webserver', function() {
  gulp.src('dist')
    .pipe(server({
      livereload: true
    }));
});
