const { merge } = require("webpack-merge");
const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "development",
  devtool: "eval-source-map",
  devServer: {
    hot: true,
    open: true,
    host: process.env.DEV_SERVER_HOST,
    port: process.env.DEV_SERVER_PORT,
  },
  module: {
    rules: [
      {
        test: /\.(sass|scss|css)$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: { sourceMap: true, importLoaders: 1, modules: false },
          },
          { loader: "sass-loader", options: { sourceMap: true } },
        ],
      },
    ],
  },
});
