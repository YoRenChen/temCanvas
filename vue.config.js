/*eslint-env node*/
const path = require("path");
const isProd = process.env.NODE_ENV === "production";

function resolve(dir) {
  return path.join(__dirname, dir);
}

const assetsCDN = {
  // webpack build externals
  externals: {
    vue: "Vue",
  },
  css: [],
  js: ["//cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.min.js"],
};

const vueConfig = {
  configureWebpack: {
    plugins: [],
    externals: isProd ? assetsCDN.externals : {},
  },

  chainWebpack: (config) => {
    config.resolve.alias.set("@$", resolve("src"));
    if (isProd) {
      config.plugin("html").tap((args) => {
        args[0].cdn = assetsCDN;
        return args;
      });
    }
  },

  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },

  runtimeCompiler: true,

  devServer: {
    port: 8000,
    disableHostCheck: true,
  },

  // disable source map in production
  productionSourceMap: true,
  lintOnSave: undefined,
  // babel-loader no-ignore node_modules/*
  transpileDependencies: [],
};

module.exports = vueConfig;
