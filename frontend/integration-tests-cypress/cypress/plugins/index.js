// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const wp = require('@cypress/webpack-preprocessor');
module.exports = (on, config) => {
  const options = {
    webpackOptions: {
      resolve: {
        extensions: ['.ts', '.tsx', '.js'],
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            loader: 'ts-loader',
            options: { transpileOnly: true },
          },
        ],
      },
    },
  };
  on('file:preprocessor', wp(options));
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  config.baseUrl = `${process.env.BRIDGE_BASE_ADDRESS || 'http://localhost:9000'}${(
    process.env.BRIDGE_BASE_PATH || '/'
  ).replace(/\/$/, '')}`;
  return config;
};
