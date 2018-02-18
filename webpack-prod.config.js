var webpack = require("webpack")
var UglifyJSPlugin = require("uglifyjs-webpack-plugin")

const config = require("./webpack.config.js")

config.devtool = "source-map"

// http://vue-loader.vuejs.org/en/workflow/production.html

config.plugins = config.plugins || []

//config.plugins.push(
//	new webpack.DefinePlugin({
//		"process.env": {
//			NODE_ENV: "\"production\""
//		}
//	})
//)

config.plugins.push(
	new UglifyJSPlugin({
		sourceMap: true,
		//compress: {
		//	warnings: false
		//}
	})
)

//config.plugins.push(
//	new webpack.LoaderOptionsPlugin({
//		minimize: true
//	})
//)

module.exports = config
