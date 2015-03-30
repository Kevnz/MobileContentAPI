'use strict';

var gulp = require('gulp'),
  browserify = require('browserify'),
  exorcist = require('exorcist'),
  source = require('vinyl-source-stream'),
  babelify = require('babelify'),
  rework = require('gulp-rework'),
  inherit = require('rework-inherit'),
  vars = require('rework-vars'),
  imprt = require('rework-import'),
  autoprefixer = require('gulp-autoprefixer'),
  reworkNPM = require('rework-npm'),
  plumber = require('gulp-plumber'),
  watch = require('gulp-watch'),
  media = require('rework-custom-media');
var plugins = require('gulp-load-plugins')();

gulp.task('coverage', function () {
 
    var coverageServer = http.createServer(function (req, resp) {
        req.pipe(fs.createWriteStream('coverage.json'))
        resp.end()
    });
 
    var port = 7358;
    coverageServer.listen(port);
    console.log("Coverage Server Started on port", port);
});
 
gulp.task('testem', ['coverage'], function () {
    gulp.src([''])
        .pipe(plugins.testem({
            configFile: 'testem.json'
        }));
});

gulp.task('nodemon', function () {
  plugins.nodemon({ script: './bin/www', env: { 'NODE_ENV': 'development' }})
    .on('restart');
});
gulp.task('test', function () {
  require('babel/register')({ modules: 'common' });
  return gulp.src('./tests/unit/*_spec.js', {read: false})
        .pipe(plugins.mocha({ reporter: 'spec', compilers: 'js:babel/register' }));
});
 
gulp.task('watch', function() {
    var server = plugins.livereload();

    plugins.watch('./app/**/*.*' , function(file) {
        gulp.start('buildjs');
        server.changed(file.path);
    });
    plugins.watch( './css/**/*.css', function(file) {
        gulp.start('buildcss');
        server.changed(file.path);
    });

});
 

//lint js files
gulp.task('lint', function() {
    gulp.src(['*.js','routes/*.js', 'public/*.js'])
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'));
});
gulp.task('buildcss', function () {
        var mediaOptions = {
            map: {
                '--small-screen': 'screen and (max-width:40em)',
                '--medium-screen': 'screen and (min-width: 40em)',
                '--large-screen': 'screen and (min-width: 60em)'
            }
        };
    return gulp.src('./css/style.css')
        .pipe(rework(reworkNPM({ 
            shim: { 
                'purecss': 'build/pure.css',
                'font-awesome' : 'css/font-awesome.css'
            }}),
            media(mediaOptions),
            vars(), 
            inherit(),
            imprt({
                path: './css/modules/'
            })
            )
        )
        .pipe(plugins.autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('public/css/'));
});

gulp.task('buildjs', function () {
 
    return browserify({ entries:['./app/app.js'], debug: true })
        .transform(babelify.configure({
          experimental: false
        })) 
        .bundle()
        .on('error', function (e) {
            console.log('browserify error');
            console.log(arguments);
            throw e;
        })
        .pipe(source('app.js'))
        .pipe(gulp.dest('./public/js')) 
        .on('end', function () {
            console.log('ended');
        });
});
gulp.task('build', ['buildjs', 'buildcss']);
// The default task (called when you run `gulp` from cli)
gulp.task('default', ['lint','nodemon', 'watch']);