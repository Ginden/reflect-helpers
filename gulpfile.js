var gulp = require("gulp");
var babel = require("gulp-babel");
var jasmine = require('gulp-jasmine');
var istanbul = require('gulp-istanbul');

gulp.task('transpile', function () {
    return gulp.src(['lib/*.js', 'lib/*.js'])
        .pipe(babel())
        .pipe(gulp.dest('dist'));
});


gulp.task('test:build', ['build'], function () {
   return gulp.src(['dist/*.js'])
       // .pipe(babel())
        .pipe(istanbul()) // Covering files
     //   .pipe(istanbul.hookRequire()) // Force `require` to return covered files
        .pipe(gulp.dest('tests/lib'));
});
gulp.task('test', ['test:build'], function () {
    return gulp.src(['tests/*.js'])
        .pipe(jasmine())
        .pipe(istanbul.writeReports()) // Creating the reports after tests ran
    .on('end', console.log)
        ;
});

gulp.task('build', ['transpile']);
gulp.task('publish', ['test', 'build']);

gulp.task('watch', ['build'], function () {
    //their could be more watchers here ofc
    gulp.watch(['lib/*'], ['build']);
});