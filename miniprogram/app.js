//app.js
App({
  onLaunch: function () 
  {
    // 云开发初始化
    wx.cloud.init({
      env: "degesundheit-2020",
      traceUser: true
    })
  }
})
