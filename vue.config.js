const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  devServer: {
    port: 8999,
    open: true,
    host: 'localhost'
  },
  transpileDependencies: true
})
