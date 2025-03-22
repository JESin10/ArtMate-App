const path = require("path");

module.exports = {
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  devServer: {
    hot: true,
    open: true,
    port: 19006,
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".svg"],
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: ["react-native-svg-transformer"],
      },
    ],
  },
};
