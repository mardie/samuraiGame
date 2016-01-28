var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    size = require('gulp-size'),
    htmlbuild = require('gulp-htmlbuild'),
    htmlmin = require('gulp-htmlmin'),
    stripDebug = require('gulp-strip-debug'),
    fs = require('fs'),
    replace = require("gulp-replace"),
    zip = require('gulp-zip');

var jsFiles = [
    './src/**/*'
];

var htmlFiles = [
    'index.html'
];

gulp.task('js', function() {
    var replacement = fs.readFileSync('./models/samurai.obj',{encoding:'utf8'});
    //console.log(replacement)
    replacement = replacement.replace(/(?:\r\n|\r|\n)/g,'<<NEWLINE>>');
    replacement = replacement.replace(/[-+]?[0-9]*\.?[0-9]+/g,function(match){
        var f = parseFloat(match);
        var i = parseInt(match);
        if(i == f && i.length == f.length){
            return match;
        }
        return parseFloat(match).toFixed(2);
    });

    //var replacement = require('./suzanne.obj');
    return gulp.src(jsFiles)
        //.pipe(replace("$.get('suzanne.obj').then(function(objData){", 'var objData="'+replacement+'";'))
        .pipe(replace("    $.get('models/samurai.obj').then(function (objData) {", 'var objData="'+replacement+'";'))
        .pipe(replace("})//CLOSING OBJDATA",''))
        .pipe(replace("newlineSep='\\n'","newlineSep='^'"))
        .pipe(concat('app.dist.js'))
        .pipe(uglify(
            {
                compress:{
                    sequences     : true,  // join consecutive statemets with the “comma operator”
                    properties    : true,  // optimize property access: a["foo"] → a.foo
                    dead_code     : true,  // discard unreachable code
                    drop_debugger : true,  // discard “debugger” statements
                    unsafe        : true, // some unsafe optimizations (see below)
                    conditionals  : true,  // optimize if-s and conditional expressions
                    comparisons   : true,  // optimize comparisons
                    evaluate      : true,  // evaluate constant expressions
                    booleans      : true,  // optimize boolean expressions
                    loops         : true,  // optimize loops
                    unused        : true,  // drop unused variables/functions
                    hoist_funs    : true,  // hoist function declarations
                    hoist_vars    : false, // hoist variable declarations
                    if_return     : true,  // optimize if-s followed by return/continue
                    join_vars     : true,  // join var declarations
                    cascade       : true,  // try to cascade `right` into `left` in sequences
                    side_effects  : true,  // drop side-effect-free statements
                    warnings      : true,  // warn about potentially dangerous optimizations/code
                    global_defs   : { PREVENTOBJ: true},
                }
            }
        ))
        .pipe(replace("<<NEWLINE>>",'^'))
        .pipe(gulp.dest('./dist'))
        .pipe(size())
});

gulp.task('html', function() {
    return gulp.src(htmlFiles)
        .pipe(replace('<script src="jquery.js"></script>',''))
        .pipe(htmlbuild({
            js: htmlbuild.preprocess.js(function (block) {
                block.write('app.dist.js');
                block.end();
            })
        }))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true
        }))
        .pipe(gulp.dest('./dist'))
        .pipe(size());
});

gulp.task('default',['js','html'],function(){
    return gulp.src(['./dist/**/*'])
        .pipe(zip('dist.zip'))
        .pipe(gulp.dest('./dist'))
        //.pipe(concat('alltogether'))
        .pipe(size())
});
