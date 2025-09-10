// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })

    wx.cloud.init({
        env: 'yun-xds-1g56kr8y3b946ebb' // 这里替换为你在腾讯云开发中设置的环境ID
    })
  },
  globalData: {
    userInfo: null
  }
})
