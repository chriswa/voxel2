var path = require("path")
var webpack = require("webpack")
//var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
var HtmlWebpackPlugin = require("html-webpack-plugin")
var UglifyJSPlugin = require("uglifyjs-webpack-plugin")

const config = {
	entry: "./src/client/main.ts",
	resolve: {
		modules: [ path.resolve(__dirname, "src/common"), "node_modules" ],
		extensions: ['.ts', '.js'],
	},
	output: {
		path: path.resolve(__dirname, "./dist"),
		publicPath: "/",
		//filename: "bundle-[hash].js",
		filename: "bundle.js",
	},
	externals: {
		"lodash": "_",
		"twgl.js": "twgl",
		"gl-matrix": "glMatrix",
		//"vec3": "vec3",
		"vec2": "vec2",
		"mat4": "mat4",
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: "babel-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.ts$/,
				loader: "ts-loader",
				options: {
					transpileOnly: true,
				},
				exclude: /node_modules/,
			},
			{
				test: /\.worker\.js$/,
				use: {
					loader: 'worker-loader',
					options: {
						name: 'worker.js', // no [hash] !
					},
				},
			},
			//{
			//	test: /\.(png|jpg|gif|svg)$/,
			//	loader: "file-loader",
			//	options: {
			//		name: "[name].[ext]?[hash]"
			//	}
			//}
		]
	},
	plugins: [
		//new ForkTsCheckerWebpackPlugin(),
		new webpack.LoaderOptionsPlugin({
			debug: true,
		}),
	],
	devServer: {
		historyApiFallback: true,
		noInfo: true,
		disableHostCheck: true,                  // allow http://raspberrypi:8080/
	},
	performance: {
		hints: false,
	},
	devtool: "#eval-source-map",
}

config.plugins.push(new HtmlWebpackPlugin({
	template: "src/client/index.ejs",
}))

if (process.env.NODE_ENV === "production") {
	config.devtool = "#source-map"
	// http://vue-loader.vuejs.org/en/workflow/production.html
	config.plugins = config.plugins || []
	config.plugins.push(
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: "\"production\""
			}
		})
	)
	config.plugins.push(
		new UglifyJSPlugin({
			sourceMap: true,
			compress: {
				warnings: false
			}
		})
	)
	config.plugins.push(
		new webpack.LoaderOptionsPlugin({
			minimize: true
		})
	)
}

module.exports = config
