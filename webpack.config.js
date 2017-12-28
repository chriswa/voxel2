var path = require("path")
var webpack = require("webpack")
var HtmlWebpackPlugin = require("html-webpack-plugin")
var UglifyJSPlugin = require("uglifyjs-webpack-plugin")

const config = {
	entry: "./src/client/main.js",
	resolve: {
		modules: [ path.resolve(__dirname, "src/common"), "node_modules" ],
	},
	output: {
		path: path.resolve(__dirname, "./dist"),
		publicPath: "/",
		filename: "bundle-[hash].js"
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
				exclude: /node_modules\/lodash/ // html-webpack-plugin seems to be trying to minify lodash because it's in a script tag?!
			},
			{
				test: /\.(png|jpg|gif|svg)$/,
				loader: "file-loader",
				options: {
					name: "[name].[ext]?[hash]"
				}
			}
		]
	},
	plugins: [],
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
