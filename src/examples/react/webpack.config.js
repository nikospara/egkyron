var path = require('path');
var webpack = require('webpack');
// see https://github.com/webpack/extract-text-webpack-plugin/issues/30 for the CSS and the ExtractTextPlugin
//var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
	devtool: 'source-map',
	context: path.join(__dirname, 'app'),
	entry: {
		javascript: './main.js',
		html: './index.html',
		vendor: ['react', 'react-dom', 'react-bootstrap', 'redux', 'react-redux']
	},
	resolve: {
		root: path.resolve('./app')
	},
	output: {
		filename: 'app.js',
		path: path.join(__dirname, '/dist'),
		// see https://github.com/webpack/style-loader/pull/96/files (the addition in README.md)
		// see https://github.com/webpack/style-loader/issues/55
		publicPath: 'http://localhost:8180/'
	},
	plugins: [
		new webpack.optimize.CommonsChunkPlugin(/* chunkName= */'vendor', /* filename= */'vendor.bundle.js'),
//		new ExtractTextPlugin('styles.css', { allChunks: true })
	],
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loaders: ['react-hot', 'babel?presets[]=react,presets[]=es2015']
			}, {
				test: /\.html$/,
				loader: 'file?name=[name].[ext]'
			}, {
				test: /\.scss$/,
				exclude: /node_modules/,
//				loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!sass-loader?sourceMap')
				loaders: ['style', 'css?sourceMap', 'sass?sourceMap']
			},
			{test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'},
			{test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'},
			{test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'},
			{test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'}
		]
	},
	sassLoader: {
		includePaths: ['./node_modules/bootstrap-sass/assets/stylesheets']
	}
};
