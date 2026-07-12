// Gulp file
const { src, dest, watch, series, parallel } = require('gulp');
const del                  = require('del');
const browserSync          = require('browser-sync');
const postcss              = require('gulp-postcss');
const concat               = require('gulp-concat');
const tersers              = require('gulp-terser');
const cleanCSS             = require('gulp-clean-css');
const purgecss             = require('gulp-purgecss');
const logSymbols           = require('log-symbols');
const fs                   = require('fs');

//Load Previews on Browser on dev
function livePreview(done){
  browserSync.init({
    startPath: "./",
    server: {
      baseDir: "./",
    },
    port: Number(process.env.PORT) || 3100,
    ui: {
      port: Number(process.env.UI_PORT) || 3001,
    }
  });
  done();
}
function watchFiles(){
  watch("./*.html", previewReload);
  watch(["./tailwind.config.js", "./src/tailwind/**/*", "./src/css/theme.css"],series(devStyles, previewReload));
  watch("./src/js/*.js",series(previewReload));
  console.log("\n\t" + logSymbols.info,"Watching for Changes..\n");
}
// reload
function previewReload(done){
  console.log("\n\t" + logSymbols.info,"Reloading Browser Preview.\n");
  browserSync.reload();
  done();
}
// delete dist
function devClean(){
  console.log("\n\t" + logSymbols.info,"Cleaning dist folder for fresh start.\n");
  return del(["./dist"]);
}
// generate css
function devStyles(){
  const tailwindcss = require('tailwindcss'); 
  return src(["./src/tailwind/tailwindcss.css", "./src/css/theme.css"])
    .pipe(postcss([
      tailwindcss("./tailwind.config.js"),
      require('autoprefixer'),
    ]))
    .pipe(concat({ path: 'style.css'}))
    .pipe(dest("./src/css"));
}
// minify css
function prodStyles(){
  return src("./src/css/style.css")
  .pipe(concat('style.css'))
  .pipe(cleanCSS({compatibility: 'ie8'}))
  .pipe(dest("./dist/css"));
}
// minify js
function pickFirstExisting(candidates, label) {
  const found = candidates.find((filePath) => fs.existsSync(filePath));
  if (!found) {
    throw new Error(`Missing vendor file for ${label}. Checked: ${candidates.join(', ')}`);
  }
  return found;
}

function prodScripts(){
  const hcStickyPath = pickFirstExisting([
    "node_modules/hc-sticky/src/hc-sticky.js",
    "src/vendors/hc-sticky/dist/hc-sticky.js",
    "src/vendors/hc-sticky/src/hc-sticky.js"
  ], "hc-sticky");

  const glightboxPath = pickFirstExisting([
    "node_modules/glightbox/dist/js/glightbox.min.js",
    "src/vendors/glightbox/dist/js/glightbox.min.js"
  ], "glightbox");

  const splidePath = pickFirstExisting([
    "node_modules/@splidejs/splide/dist/js/splide.min.js",
    "src/vendors/@splidejs/splide/dist/js/splide.min.js"
  ], "splide");

  const splideVideoPath = pickFirstExisting([
    "node_modules/@splidejs/splide-extension-video/dist/js/splide-extension-video.min.js",
    "src/vendors/@splidejs/splide-extension-video/dist/js/splide-extension-video.min.js"
  ], "splide-extension-video");

  return src([
   hcStickyPath,
   glightboxPath,
   splidePath,
   splideVideoPath,
   "src/js/meridian-config.js",
   "src/js/signal-engine.js",
   "src/js/pdf-report.js",
   "src/js/meridian-platform.js",
    "src/js/theme.js"
  ])
  .pipe(concat({ path: 'scripts.js'}))
  .pipe(tersers())
  .pipe(dest("./dist/js"));
}
// finish log
function buildFinish(done){
  console.log("\n\t" + logSymbols.info,`Production is complete.\n`);
  done();
}
// Clean vendors
function cleanvendor() {
  return del(["./src/vendors/"]);
}
// Copy File from vendors
function copyvendors() {
  return src([
    './node_modules/*glightbox/**/*',
    './node_modules/*hc-sticky/**/*',
    './node_modules/*@splidejs/splide/**/*',
    './node_modules/*@splidejs/splide-extension-video/**/*'
  ])
  .pipe( dest('./src/vendors/'))
}

exports.updatevendors = series(cleanvendor, copyvendors);
exports.default = series( devClean, devStyles, livePreview, watchFiles);
exports.prod = series(
  devClean,
  devStyles,
  parallel(prodStyles, prodScripts), //Run All tasks in parallel
  buildFinish
);