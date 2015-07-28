var gulp = require('gulp');
var gutil = require('gulp-util');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var serve = require('gulp-serve');


var paths = {
    sass: ['./scss/**/*.scss'],
    mobileScripts: ['./js/common/**/*.js', './js/mobile/**/{!(app.js), *.js}', './js/mobile/app.js'],
    desktopScripts: ['./js/common/**/*.js', './js/desktop/**/{!(app.js), *.js}', './js/desktop/app.js'],
    desktopTemplates: ['./desktop/**'],
    bower: ['./www/lib/**/*'],
    desktopBuild: ['./dist']
};

gulp.task('default', ['sass', 'scripts', 'desktopScripts', 'desktop', 'bower']);

gulp.task('scripts', function () {
    return gulp.src(paths.mobileScripts)
        .pipe(sourcemaps.init())
        .pipe(babel({
            modules: 'amd',
            moduleIds: true
        }))
        .pipe(concat('all.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./www/js'));
});

gulp.task('desktopScripts', function () {
    return gulp.src(paths.desktopScripts)
        .pipe(sourcemaps.init())
        .pipe(babel({
            modules: 'amd',
            moduleIds: true
        }))
        .pipe(concat('all.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.desktopBuild + '/js'));
});

gulp.task('bower', function () {
    return gulp.src(paths.bower)
        .pipe(sourcemaps.init())
        .pipe(gulp.dest(paths.desktopBuild + '/lib' ));
});

gulp.task('desktop', function() {
    gulp.src('./desktop/**')
        .pipe(gulp.dest('./dist/'));
});

gulp.task('serve', serve('dist'));

gulp.task('sass', function (done) {
    gulp.src('./scss/**.scss')
        .pipe(sass())
        .pipe(gulp.dest('./www/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest('./www/css/'))
        .on('end', done);
});

gulp.task('watch', function () {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.mobileScripts, ['scripts']);
    gulp.watch(paths.desktopScripts, ['desktopScripts']);
    gulp.watch(paths.desktopTemplates, ['desktop']);
});

gulp.task('install', ['git-check'], function () {
    return bower.commands.install()
        .on('log', function (data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        });
});

gulp.task('git-check', function (done) {
    if (!sh.which('git')) {
        console.log(
            '  ' + gutil.colors.red('Git is not installed.'),
            '\n  Git, the version control system, is required to download Ionic.',
            '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
            '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
        );
        process.exit(1);
    }
    done();
});
