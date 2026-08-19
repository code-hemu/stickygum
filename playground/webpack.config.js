import path from "path"
import { fileURLToPath } from "url"
import webpack from "webpack"
import HtmlWebpackPlugin from "html-webpack-plugin"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const configurationFactory = (_env, { mode = "development" } = {}) => ({
  context: __dirname,
  entry: "./index.js",
  mode,
  resolve: {
    extensions: [".js", ".jsx", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|svg|ico)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/[name].[contenthash][ext]",
        },
      },
    ],
  },
  devtool: mode === "development" ? "inline-source-map" : "source-map",
  output: {
    path: path.resolve(__dirname, "dist"),
    clean: true,
    filename: "[name].js?[contenthash]",
  },
  devServer: {
    host: "0.0.0.0",
    allowedHosts: "all",
    static: [
      { directory: path.resolve(__dirname, ".."), watch: true },
      { directory: path.resolve(__dirname, "examples"), publicPath: "/examples", watch: true },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({ __DEV__: JSON.stringify(mode === "development") }),
    new HtmlWebpackPlugin({
      template: "./index.html",
      title: "StickyGum Playground",
    }),
  ],
})

export default configurationFactory