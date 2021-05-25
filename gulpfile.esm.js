import gulp from 'gulp';
import sass from 'gulp-sass';
import map from 'gulp-sourcemaps';
import webpackStream from 'webpack-stream';
import webpack from 'webpack';
import webserver from 'gulp-webserver';
import image from 'gulp-image';
import { resolve } from 'path';

const preComp = ({ minify }) =>
  gulp
    .src(resolve(__dirname, 'src', 'sass', '**', '*.scss'))
    .pipe(map.init())
    .pipe(sass({ outputStyle: minify ? 'compressed' : 'expanded' }))
    .pipe(map.write('./'))
    .pipe(gulp.dest(resolve(__dirname, 'dist', 'css')));

const bundleJS = ({ mode }) =>
  gulp
    .src(resolve(__dirname, 'src', 'js', 'index.js'))
    .pipe(
      webpackStream(
        {
          mode,
          devtool: 'source-map',
          output: {
            filename: 'index.js',
          },
          module: {
            rules: [
              {
                test: /\.js/,
                exclude: /node_modules/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/preset-env'],
                    plugins: ['@babel/plugin-transform-runtime'],
                  },
                },
              },
            ],
          },
        },
        webpack
      )
    )
    .pipe(gulp.dest(resolve(__dirname, 'dist', 'js')));

const imageMinifier = () =>
  gulp
    .src(resolve(__dirname, 'src', 'image', '**', '*'))
    .pipe(image())
    .pipe(gulp.dest(resolve(__dirname, 'dist', 'image')));

gulp.task('sass', () => preComp({ minify: true }));
gulp.task('js', () => bundleJS({ mode: 'production' }));
gulp.task('image', () => imageMinifier());

gulp.task(
  'build',
  gulp.parallel(
    () => bundleJS({ mode: 'production' }),
    () => preComp({ minify: true }),
    () => imageMinifier()
  )
);

export default () => {
  gulp.src(resolve(__dirname)).pipe(
    webserver({
      livereload: true,
      open: true,
      directoryListening: resolve(__dirname, 'dist'),
    })
  );

  gulp.watch(resolve(__dirname, 'src', 'sass', '**', '*'), { ignoreInitial: false }, () => preComp({ minify: false }));

  gulp.watch(resolve(__dirname, 'src', 'js', '**', '*'), { ignoreInitial: false }, () =>
    bundleJS({ mode: 'development' })
  );

  gulp.watch(resolve(__dirname, 'src', 'image', '**', '*'), { ignoreInitial: false }, () => imageMinifier());
};
