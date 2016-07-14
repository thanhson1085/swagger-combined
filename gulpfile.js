var gulp = require('gulp');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var lazypipe = require('lazypipe');
var del = require('del');
var eslint = require('gulp-eslint');

gulp.task('default', ['lint', 'routes', 'bin']);

var doBabel = lazypipe()
  .pipe(babel)
  .pipe(sourcemaps.write, 'dist');

gulp.task('routes', function() {
  return gulp.src(['code/routes/**/*.js'])
    .pipe(doBabel())
    .pipe(gulp.dest('routes'));
});

gulp.task('bin', function() {
  return gulp.src(['code/bin/**/*.js'])
    .pipe(doBabel())
    .pipe(gulp.dest('bin'))
})

gulp.task('lint', function() {
  return gulp.src(['code/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
});

gulp.task('clean', function() {
  return del(['bin/*', 'routes/*'])
})