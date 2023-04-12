const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: 'WakeUp',
        appId: 'de.johannj.wakeup',
        mac: {
          icon: '/Users/johann/Developer/wake-up/public/logo.icns',
        },
        win: {
          icon: 'C:\\Projekte\\WakeUp\\public\\logo.ico',
        },
        linux: {
          icon: '/Users/johann/Developer/wake-up/public/logo.png',
        },
      },
    },
  },
})
