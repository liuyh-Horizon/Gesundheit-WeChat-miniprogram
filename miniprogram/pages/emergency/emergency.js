// miniprogram/pages/emergency/emergency.js
const newMsg = wx.cloud.database().collection("NewMessage");
const helpMsg = wx.cloud.database().collection("HelpMessage");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showMessageDialog: false,
    showHelpDialog: false,
    showFeedContactDialog: false,

    helpTitle:'',     //求助信息题目
    helpContent: '',  //求助信息内容
    helpContact: '',  //求助者联系方式

    showInfoText: 0,
    infoTitle: ['提示','信息授权', '数据风险', '联系信息'],
    securityText: ['请注意，留言服务可能需要您留下联系方式和姓名，数据授权及风险如后所示。已上传留言可随时通过本系统清除。',
                   '本程序所使用的微信昵称头像及OpenID等个人信息由微信小程序平台提供，遵循微信小程序数据授权流程，解释权归中国腾讯公司所有。除此以外，本程序还需要一些必要的个人信息。此个人信息非强制要求提供，可提交，可不提交，也可部分提交。所有数据仅为本平台接收到用户求助，或后台发现用户选择上传发烧体温数据但未及时联系时，与用户沟通所需，不会另做他用。所有数据的存储及传输均基于微信云平台，为本程序正常使用的必要环节，存储位置有可能不在欧盟范围内。本程序仅在接到求助时，与用户的直接沟通方，可能并不限于中国各驻德使领馆、各地学联及志愿者共享必要数据。参与各方皆已签订协议同意遵守欧盟GDPR相关法律，保护用户数据安全。所需信息包括：姓名、护照类型、护照号、紧急联系人的联系方式、体温数据，以及学联等组织可能发送物资时所需的通信地址信息，填写上传即视为同意授权我方收集并使用相应数据，用户有权在任意时刻修改或删除我方数据库内的个人数据。所有数据将在疫情结束后彻底删除，您可以随时以电子邮件的形式向我方撤回此同意。同意书撤回后，我方已完成的信息收集工作仍具有合法性。',
      '我方高度重视您的个人数据安全，并采取了多种保障手段。尽管如此，仍无法排除下列潜在风险：1）您的个人数据有可能会被第三方非法获取并利用，用于疫情互助外的其他目的。2）您可能无法向中华人民共和国外交部及驻德使领馆、各学联、中国腾讯公司主张并行使知情权。同时，本程序所有数据的存储及传输均基于微信云平台，因此服务器可能并不位于欧盟境内。因此有如下两大风险：1）欧盟委员会尚未制定关于中华人民共和国的实施性法案（该法案依据为《一般数据保护条例》第45条第1款与第3款）。这意味着，欧盟委员会尚未裁定中华人民共和国的数据保护水平是否符合欧盟的要求。2）根据《一般数据保护条例》第46条第1款，向第三国传输数据需要适当的安全保障，目前关于微信云平台是否完全符合欧盟要求的安全保障，对此尚无定论。如果您认可此风险，并仍同意我方使用您的数据，请点击同意进入数据录入界面。所有数据将在疫情结束后彻底删除，您可以随时以电子邮件或留言的形式向我方撤回此授权。授权撤回后，我方已完成的信息收集工作仍具有合法性。'],

  },

  /***** 生命周期函数--监听页面加载 *****/

  onLoad: function (options) {},

  /***** 生命周期函数--监听页面初次渲染完成 *****/

  onReady: function () 
  {
    wx.hideLoading();
  },

  /***** 生命周期函数--监听页面显示 *****/

  onShow: function () {},

  /***** 生命周期函数--监听页面隐藏 *****/

  onHide: function () {},

  /***** 生命周期函数--监听页面卸载 *****/

  onUnload: function () {},

  /***** 页面相关事件处理函数--监听用户下拉动作 *****/

  onPullDownRefresh: function () {},

  /***** 页面上拉触底事件的处理函数 *****/

  onReachBottom: function () {},

  /***** 用户点击右上角分享 *****/

  onShareAppMessage: function () {},

  /***** 点击留言求助事件 *****/

  msgClick() 
  {
    this.setData({
      showMessageDialog: !this.data.showMessageDialog //打开留言求助界面
    });
  },

  /***** 关闭留言求助事件 *****/

  closeMsg() //关闭留言求助界面按钮
  {
    let page = this;
    
    //获取后台设置
    newMsg.where({
      _id: 'isUsable'
    })
    .get({
      success(e) 
      {
        if (e.data[0].usable) //如果数据上传可用
        {
          page.setData({
            showInfoText: page.data.showInfoText + 1 //展示数据授权协议
          });
          console.log(page.data.showInfoText);
        }
        else  //如果数据上传不可用
        {
          page.setData({
            showFeedContactDialog: !page.data.showFeedContactDialog //转入反馈界面求助
          });
        }
      }
    })
  },

  /***** 留言求助界面：点击界面外侧事件 *****/

  toggleHelpDialog() 
  {
    this.setData({
      showMessageDialog: !this.data.showMessageDialog, //关闭留言求助界面
      showInfoText: 0
    });
  },

  /***** 留言求助界面：关闭界面事件 *****/

  closeHelp() {
    this.setData({
      showMessageDialog: !this.data.showMessageDialog, //关闭留言求助界面
      showInfoText: 0
    });
  },

  /***** 留言求助界面：发送求助事件 *****/

  submitHelp() 
  {
    let page = this;

    wx.showLoading({
      title: '上传中',
    })

    //将求助留言添加至数据集合HelpMessage中
    helpMsg.add({
      data:
      {
        title: page.data.helpTitle,       //留言题目
        contect: page.data.helpContent,   //留言内容
        contact: page.data.helpContact    //求助者联系方式
      },
      complete: function (e) 
      {
        page.setData({
          showMessageDialog: !page.data.showMessageDialog, //关闭留言求助界面
          showInfoText: 0
        });
        wx.hideLoading();
      }
    })
  },

  /***** 留言求助界面：清空求助事件 *****/

  cleanHelp() 
  {
    let page = this;

    wx.showLoading({
      title: '清除中',
      mask:true
    })

    //调用云函数清理留言信息
    wx.cloud.callFunction({
      name: 'cleanHelpMessage', //云函数名
      success: function (e) 
      {
        console.log("所有求助信息已删除", e);

        wx.showModal({
          title: '提示',
          content: '您所有的求助信息已从后台数据库删除，如仍需要帮助，欢迎留言或通过在线求助功能与我们取得联系',
          showCancel: false
        })

        wx.hideLoading();
      },
    })

    page.setData({
      showMessageDialog: !page.data.showMessageDialog, //关闭留言求助界面
      showInfoText: 0
    });
  },

  /***** 关闭反馈求助提示界面事件 *****/

  closeFeedContact() 
  {
    this.setData({
      showFeedContactDialog: !this.data.showFeedContactDialog //关闭反馈求助提示界面
    });
  },

  /***** 求助信息题目输入绑定 *****/

  helpTitleInput: function (e) 
  {
    this.setData({
      helpTitle: e.detail.value
    })
  },

  /***** 求助信息内容输入绑定 *****/

  helpContentInput: function (e) 
  {
    this.setData({
      helpContent: e.detail.value
    })
  },

  /***** 求助信息联系方式输入绑定 *****/

  helpContactInput: function (e)
  {
    this.setData({
      helpContact: e.detail.value
    })
  }
})