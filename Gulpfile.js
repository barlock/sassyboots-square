var autoprefixer = require('gulp-autoprefixer'),
    cache = require("gulp-cached"),
    express = require("express"),
    gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    path = require("path"),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    scsslint = require("gulp-scss-lint"),
    tinylr = require("tiny-lr")();

var paths = {
    "example": "examples/**/*.*",
    "sass": ["sass/**/*.scss"],
    "sassTheme": ["sass/*.scss", "examples/sass/*.scss"]
};

gulp.task('express', function() {
    var app = express();
    app.use(require('connect-livereload')({port: 4002}));
    app.use(express.static(path.relative(__dirname, ".build")));
    app.listen(4000);
    console.log("Server listening on port 4000");
});

gulp.task('livereload', function() {
    tinylr.listen(4002);
});

function notifyLiveReload(event) {
    var fileName = path.relative(__dirname, event.path);

    tinylr.changed({
        body: {
            files: [fileName]
        }
    });
}

gulp.task('styles', function() {
    return gulp.src(paths.sassTheme)
        .pipe(sass({ style: 'expanded' }))
        .pipe(autoprefixer("> 1%", "last 2 versions", "Firefox ESR", "Opera 12.1"))
        .pipe(gulp.dest('.build/css'))
});

gulp.task("scsslint", function() {
   gulp.src(paths.sass.concat(paths.sassTheme))
       .pipe(scsslint({
           bundleExec: true
       }))
});

gulp.task("minify", ["styles"], function() {
   return gulp.src(".build/css/*.css")
       .pipe(rename({suffix: '.min'}))
       .pipe(minifycss())
       .pipe(gulp.dest('dist/css'));
});

gulp.task('watch', function() {
    gulp.watch(paths.sass.concat(paths.sassTheme), ["scsslint", "styles"]);
    gulp.watch(paths.html, ["copyExamples"]);
    gulp.watch(paths.examples, gulp.dest(".build"));
    gulp.watch('.build/**/*.*', notifyLiveReload);
});

gulp.task("copyExamples", function() {
    gulp.src(paths.example)
        .pipe(gulp.dest(".build"))
});

gulp.task("copyVendor", ["styles"], function() {
    gulp.src("bower_components/**/*.*")
        .pipe(gulp.dest(".build/vendor"));
});

gulp.task("build", ["copyVendor", "copyExamples"]);

gulp.task('default', ["build", 'express', 'livereload', 'watch']);

gulp.task("publish", ["build", "minify"], function() {
    gulp.src(".build/css/*.css")
        .pipe(gulp.dest("dist/css"));
});
