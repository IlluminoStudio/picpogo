import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 900,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    retries: {
      runMode: 0,
      openMode: 0
    },
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 10000
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
});
