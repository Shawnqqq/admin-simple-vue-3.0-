var webpack = require("webpack");

module.exports = {
  devServer: {
    open: true,
    host: "test" + process.env.VUE_APP_DOMAIN
  },
  chainWebpack: config => {
    config.plugin("provide").use(webpack.ProvidePlugin, [
      {
        "window.Quill": "quill"
      }
    ]);
  }
};
