var gulp = require("gulp");
var babel = require("gulp-babel");
var jasmine = require('gulp-jasmine');

gulp.task('transpile', function() {
    return gulp.src(['lib/*.js', 'lib/*.js'])
        .pipe(babel())
        .pipe(gulp.dest('dist'));
});

gulp.task('test', function () {
    return gulp.src('tests/*.js')
        .pipe(jasmine());
});

gulp.task('build', ['transpile']);
gulp.task('publish', ['test', 'build']);

gulp.task('watch', ['build'], function() {
    //their could be more watchers here ofc
    gulp.watch(['lib/*'], ['build']);
});