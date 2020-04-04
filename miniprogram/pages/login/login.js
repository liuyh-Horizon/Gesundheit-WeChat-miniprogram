// pages/login/login.js
const appUserInfo = wx.cloud.database().collection("GesundheitUserInfo"); //注册用户个人信息数据集合
const notContact = wx.cloud.database().collection("FeverAndNotContacted"); //以发热未联络用户信息数据集合
const newMsg = wx.cloud.database().collection("NewMessage"); //系统控制及新消息通知数据集合
const teenLics = wx.cloud.database().collection("TeenagerLicense"); //未成年人监护人授权信息
const goodsApply = wx.cloud.database().collection("GoodsApplications"); //抗疫活动登记信息数据集合
const historyLog = wx.cloud.database().collection("RegHistoryLog"); //用户注册注销时间记录数据集合

var id = ''; //用户的微信OpenID

var applyName     = '';  //抗疫活动登记者姓名
var applyCity     = '';  //抗疫活动登记者所在城市
var applyAddr     = '';  //抗疫活动登记者详细地址
var applyPost     = '';  //抗疫活动登记者邮编
var applyContact  = '';  //抗疫活动登记者联系方式

Page({
  /* 页面的初始数据 */
  data: {
    temp_value: "", //用户体温输入数据

    /* 弹窗显示控制 */
    showNormalDialog: false,        //体温正常弹窗
    showFeverDialog: false,         //发热弹窗
    showMistakeDialog: false,       //体温输入超界弹窗
    showErrorDialog: false,         //体温输入错误弹窗
    showRegDialog: false,           //授权配置界面弹窗
    showInfoDialog: false,          //个人信息提交弹窗
    showstillFeverDialog: false,    //开机检测发烧状态弹窗
    showNewsDialog: false,          //新消息通知弹窗
    showTeenagerDialog: false,      //未成年人监护者授权弹窗
    showNewGoodsDialog: false,      //新抗疫活动注册弹窗
    showNewUserDialog: false,       //新用户注册弹窗

    showInfoTextNo: 0,  //个人信息提交弹窗：界面切换索引
    infoTitle: ['信息授权', '数据风险', '联系信息'], //个人信息提交弹窗：标题
    /***** 个人信息提交弹窗：显示内容文本（信息授权协议及数据风险通知）*****/
    securityText: ['本程序所使用的微信昵称头像及OpenID等个人信息由微信小程序平台提供，遵循微信小程序数据授权流程，解释权归中国腾讯公司所有。除此以外，本程序还需要一些必要的个人信息。此个人信息非强制要求提供，可提交，可不提交，也可部分提交。所有数据仅为本平台接收到用户求助，或后台发现用户选择上传发烧体温数据但未及时联系时，与用户沟通所需，不会另做他用。所有数据的存储及传输均基于微信云平台，为本程序正常使用的必要环节，存储位置有可能不在欧盟范围内。本程序仅在接到求助时，与用户的直接沟通方，可能并不限于中国各驻德使领馆、各地学联及志愿者共享必要数据。参与各方皆已签订协议同意遵守欧盟GDPR相关法律，保护用户数据安全。所需信息包括：姓名、护照类型、护照号、紧急联系人的联系方式、体温数据，以及学联等组织可能发送物资时所需的通信地址信息，填写上传即视为同意授权我方收集并使用相应数据，用户有权在任意时刻修改或删除我方数据库内的个人数据。所有数据将在疫情结束后彻底删除，您可以随时以电子邮件的形式向我方撤回此同意。同意书撤回后，我方已完成的信息收集工作仍具有合法性。',
                   '我方高度重视您的个人数据安全，并采取了多种保障手段。尽管如此，仍无法排除下列潜在风险：1）您的个人数据有可能会被第三方非法获取并利用，用于疫情互助外的其他目的。2）您可能无法向中华人民共和国外交部及驻德使领馆、各学联、中国腾讯公司主张并行使知情权。同时，本程序所有数据的存储及传输均基于微信云平台，因此服务器可能并不位于欧盟境内。因此有如下两大风险：1）欧盟委员会尚未制定关于中华人民共和国的实施性法案（该法案依据为《一般数据保护条例》第45条第1款与第3款）。这意味着，欧盟委员会尚未裁定中华人民共和国的数据保护水平是否符合欧盟的要求。2）根据《一般数据保护条例》第46条第1款，向第三国传输数据需要适当的安全保障，目前关于微信云平台是否完全符合欧盟要求的安全保障，对此尚无定论。如果您认可此风险，并仍同意我方使用您的数据，请点击同意进入数据录入界面。所有数据将在疫情结束后彻底删除，您可以随时以电子邮件或留言的形式向我方撤回此授权。授权撤回后，我方已完成的信息收集工作仍具有合法性。'],

    showNewUserTextNo: 0,  //新用户注册弹窗：界面切换索引
    newUserTitle: ['国籍信息', '年龄信息', '信息授权', '数据风险', '联系信息'], //新用户注册弹窗：标题
    /***** 新用户注册弹窗：显示内容文本（国籍与年龄信息确认）*****/
    newUserText: ['请问您是否拥有中国国籍？受欧盟隐私法案GDPR影响，本程序无法向非中国籍华人开放数据收集服务，仅进行最基本的微信小程序授权，解释权归腾讯公司所有。如想撤回注册，请注销，敬请谅解。紧急联络功能仍可为您服务，我们与您同在。',
                  '请问您是已达到16周岁？（欧盟数字成人年龄）受欧盟隐私法案GDPR影响，本程序无法向未获得监护人授权的未成年人开放数据收集服务，仅进行最基本的微信小程序授权，解释权归腾讯公司所有。如想撤回注册，请注销，敬请谅解。紧急联络功能仍可为您服务，我们与您同在。如希望上传以方便志愿者联络，请点“否”后选择填写监护人授权信息，此信息收集遵循欧盟GDPR相关法规，本未成年用户注销时将一并删除，疫情结束后本程序收集的所有数据将全部清空。详细相关数据保护协议，可在后续个人数据上传时查看。',
      ''],
    cancelTexts: ['否', '未满', '放弃', '拒绝', '放弃'], //新用户注册弹窗：取消按钮文本
    confirmTexts: ['是', '已满', '授权', '同意', '了解'], //新用户注册弹窗：确认按钮文本

    showFeverTextNo: 0,  //发热弹窗：界面切换索引
    /***** 发热弹窗：显示内容文本（上传授权去联系询问）*****/
    feverText: ['您的体温偏高，也许正在发烧，请问是否上传体温数据至后台？上传意味着您同意后台及志愿者等帮助提供方查看，并根据预留信息与您联系。已上传数据可通过注销或输入一个正常体温清空，所有数据将在疫情结束后删除。',
                  '感谢您的信任，请问您现在是否希望联系志愿者？本程序提供在线联络平台。与志愿者的在线沟通过程中我们有可能需要您提供一些个人信息，授权协议及数据风险通注册时所示相同。'],
    feverCancel: ['拒绝', '下次'], //发热弹窗：取消按钮文本
    feverConfirm: ['上传', '联系'], //发热弹窗：确认按钮文本

    showNewsTextNo: 0,  //新消息通知弹窗：界面切换索引

    regText: "未注册",  //显示：用户是否已注册

    isFever: false,     //是否发烧标记
    isDisabled: true,   //数据上传是否可用标记
    isChinese: false,   //是否中国籍标记
    isTeenager: true,   //是否成年标记
    isLicensed: false,  //是否获得监护人授权标记

    userName: '',       //用户姓名
    userStudent: '',    //用户身份（是否是学生）
    userVisa: '',       //用户护照号
    userContact: '',    //用户联系方式
    emerName: '',       //紧急联系人姓名
    emerRelation: '',   //紧急联系人关系
    emerContact: '',    //紧急联系人联络方式

    totalUserNum: 0,    //总注册用户数量

    newsContent: '',    //新消息内容
    newsTotalNum: 0,    //新消息总数
    newsCurrentNum: 0,  //当前消息编号

    timerID: '',  //定时器ID，用于软件退出时注销定时器

    newsNo: '',         //消息版本编号，根据此编号确定是否有后台消息更新
    newsShowing: false, //显示消息标志

    measure_method: '设置测量方式',      //体温检测方式名
    measure_method_id: -1,              //体温检测方式编号
    temp_offset: [0.0, 0.2, 0.8, 0.5],  //体温检测方式温度范围偏移

    parentsName: '',      //监护人姓名
    parentsRelation: '',  //监护人与未成年用户的关系
    parentsID: '',        //监护人证件号
    
    city_index:0,     //活动登记城市代码
    city_array: [],   //活动登记城市名称
    hasGoods: false   //是否有活动登记标志
  },

  /***********************************************/
  /*
  /*                系统运行功能函数
  /*
  /***********************************************/

  /***** 生命周期函数--监听页面加载 *****/

  onLoad: function (options) 
  {
    var page = this;

    wx.showLoading({
      title: '数据加载中',
      mask: true
    })

    //获取用户对本小程序的OpenID等基本微信数据的授权状态
    wx.getSetting({
      success: function (res) 
      {
        if (res.authSetting['scope.userInfo']) //如果用户已授权
        {
          page.setData({  
            isDisabled: false,  //数据上传可用
            regText: "已注册"   //注册状态设为已注册
          })

          //获取总注册用户数量
          appUserInfo.count({
            success(e) 
            {
              //因为本人已授权，需扣除本人得到其他授权者的数量
              page.setData({
                totalUserNum: e.total-1
              })
            }
          })
        } 
        else //如果用户未授权
        {
          page.setData({
            isDisabled: true, //数据上传不可用
            regText: "未注册" //注册状态设为未注册
          })

          //获取总注册用户数量
          appUserInfo.count({
            success(e) 
            {
              //因为本人未授权，直接获得其他授权者的数量
              page.setData({
                totalUserNum: e.total
              })
            }
          })
        }
      },
      complete: function (res) //判断注册状态后
      {
        //获取用户OpenID及其他基本信息
        page.getOpenid();
      }
    });
  },

  //获取用户OpenID及其他基本信息
  getOpenid() 
  {
    let page = this;

    //调用获取OpenID的微信云函数
    wx.cloud.callFunction({ 
      name: 'getOpenid',    //微信云函数名
      success: function(e)  //如果调用成功
      {
        id = e.result.openid; //保存用户OpenID
        console.log('openid: ', id);  //输出显示

        //根据用户OpenID从数据库GesundheitUserInfo数据集合调取用户信息
        appUserInfo.where({
          _openid: id
        })
        .get({
          complete(res) //读取完成
          {
            wx.hideLoading();

            //根据读取信息设置用户是否为中国籍，是否成年，是否获得监护人授权
            page.setData({
              isChinese: res.data[0].isChinese,
              isTeenager: res.data[0].isTeenager,
              isLicensed: res.data[0].isLicensed
            });

            //根据读取信息暂存用户个人信息
            page.setData({
              userName: res.data[0].name,               //用户姓名
              userStudent: res.data[0].isStudent,       //用户身份（是否是学生）
              userVisa: res.data[0].visa,               //用户护照号
              userContact: res.data[0].contact,         //用户联系方式
              emerName: res.data[0].emer,               //紧急联系人姓名
              emerRelation: res.data[0].emer_relation,  //紧急联系人关系
              emerContact: res.data[0].emer_contact,    //紧急联系人联系方式
              isFever: res.data[0].fever                //用户是否已发热
            })

            console.log(res);

            //如果用户已发热
            if (res.data[0].fever) 
            {
              //弹出弹窗询问用户是否好转，是否仍需联系志愿者
              page.setData({
                showstillFeverDialog: !page.data.showstillFeverDialog
              });
              console.log("发烧了");
            }
          }
        })

        //从后台数据库的NewMessage数据集合，newMessage条目读取新通知设定
        newMsg.where({
          _id: 'newMessage'
        })
        .get({
          complete(res) //读取完成
          {
            console.log(res);

            //设置有活动需要登记人员的城市名单
            page.setData({
              city_array: res.data[0].cities
            });

            //如果有需要显示的消息通知
            if (res.data[0].isNew) 
            {
              page.setData({
                newsContent: res.data[0].msg[res.data[0].amount - 1], //设置消息内容，最新消息最新显示
                newsTotalNum: res.data[0].amount, //设置消息总数
                newsCurrentNum: 1,                //设置目前消息编号
                hasGoods: res.data[0].hasGoods    //根据读取的数据设置是否有登记活动
              });

              page.setData({
                newsShowing: true //设置显示新消息通知弹窗
              });

              //从后台数据库的NewMessage数据集合，newsNo条目读取新通知版本号
              newMsg.where({
                _id: 'newsNo'
              })
              .get({
                complete(res) 
                {
                  page.setData({
                    newsNo: res.data[0].no //记录当前新通知版本号
                  });
                }
              })

              //显示新消息通知弹窗
              page.setData({
                showNewsDialog: !page.data.showNewsDialog
              });
            }
          }
        })
      }
    })
  },

  /***** 生命周期函数--监听页面初次渲染完成 *****/

  onReady: function (){},

  /***** 生命周期函数--监听页面显示 *****/
 
  onShow: function () 
  {
    let page = this;

    page.data.timerID = setInterval(function () //设置定时器，2分钟为一周期
    {
      //从后台数据库的NewMessage数据集合，newsNo条目读取新通知版本号
      newMsg.where({
        _id: 'newsNo'
      })
      .get({
        complete(res) { //读取结束

          //刷新注册用户总数
          //获取用户对本小程序的OpenID等基本微信数据的授权状态
          wx.getSetting({
            success: function (res) 
            {
              if (res.authSetting['scope.userInfo']) //如果用户已授权
              {
                //获取总注册用户数量
                appUserInfo.count
                  ({
                    success(e) 
                    {
                      //因为本人已授权，需扣除本人得到其他授权者的数量
                      page.setData({ totalUserNum: e.total - 1 })
                    }
                  })
              }
              else //如果用户未授权
              {
                //获取总注册用户数量
                appUserInfo.count
                  ({
                    success(e) 
                    {
                      //因为本人未授权，直接获得其他授权者的数量
                      page.setData({ totalUserNum: e.total })
                    }
                  })
              }
            }
          });

          //如果当前新通知版本号与数据库中记录不同，且新消息弹窗未显示
          if ((page.data.newsNo != res.data[0].no)&&(page.data.newsShowing == false))
          {
            //从后台数据库的NewMessage数据集合，newMessage条目中读取通知数据
            newMsg.where({
              _id: 'newMessage'
            })
            .get({
              complete(e) //读取完成
              {
                if (e.data[0].isNew) //如果允许显示新通知
                {
                  //设置第一条消息内容及页码
                  page.setData({
                    newsContent: e.data[0].msg[e.data[0].amount - 1],
                    newsTotalNum: e.data[0].amount,
                    newsCurrentNum: 1
                  });

                  //显示新消息通知窗口
                  page.setData({
                    showNewsDialog: !page.data.showNewsDialog
                  });

                  //存储当前新消息版本号
                  page.setData({
                    newsNo: res.data[0].no
                  });
                }
              }
            })
          }
        }
      })
    }, 120000); //120000ms，两分钟
  },

  /***** 生命周期函数--监听页面隐藏 *****/

  onHide: function () {},

  /***** 生命周期函数--监听页面卸载 *****/

  onUnload: function () 
  {
    let page = this;
    clearInterval(page.data.timerID); //注销定时器
  },

  /***** 页面相关事件处理函数--监听用户下拉动作 *****/

  onPullDownRefresh: function () {},

  /***** 页面上拉触底事件的处理函数 *****/

  onReachBottom: function () {},

  /***** 用户点击右上角分享 *****/

  onShareAppMessage: function () {},

  /***** 切换到紧急联络页面 *****/

  gotoEmergency: function(param)
  {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.navigateTo({url: '../emergency/emergency',})
  },

  /***********************************************/
  /*
  /*                体温申报功能函数
  /*
  /***********************************************/

  /***** 体温输入绑定 *****/

  tempValueInput: function (e) 
  {
    this.setData({
      temp_value: e.detail.value
    })
  },

  /***** 体温输入：点击核验按钮事件 *****/

  tempBtnClick: function (e) 
  {
    var page = this;

    //如果体温输入方式已设定
    if (page.data.measure_method_id!=-1)
    {
      //如果输入非数字
      if (isNaN(Number(page.data.temp_value))) 
      {
        this.setData({
          showErrorDialog: !page.data.showErrorDialog, //显示体温输入报错窗口
          temp_value: '' //清空体温输入框
        });
      }
      else 
      {
        //如果输入体温不在正常人体体温范围内
        if ((Number(page.data.temp_value) < 35.8) || (Number(page.data.temp_value) > 42.5)) 
        {
          page.setData({
            showMistakeDialog: !page.data.showMistakeDialog, //显示体温输入超界窗口
            temp_value: '' //清空体温输入框
          });
        }
        //如果输入体温提示可能发热
        else if (Number(page.data.temp_value) > 37.3 + page.data.temp_offset[page.data.measure_method_id]) 
        {
          page.setData({
            showFeverDialog: !page.data.showFeverDialog //显示发热弹窗
          });
        }
        //如果输入体温正常
        else if ((Number(page.data.temp_value) >= 35.8) && (Number(page.data.temp_value) <= 37.3 + page.data.temp_offset[page.data.measure_method_id])) 
        {
          wx.showLoading({
            title: '清理中',
            mask: true
          })

          //获取当前时间
          var timestamp = Date.parse(new Date());
          var date = Date(timestamp);

          if (page.data.isFever) //如果用户之前已发热
          {
            appUserInfo.doc(id) //更新后台数据库中的个人体温数据
              .update({
                data:
                {
                  temp: 0,          //清空体温信息
                  fever: false,     //设置为未发热
                  startDate: date   //设置开始时间
                },
                complete: function (e) 
                {
                  wx.hideLoading(); //关闭等待加载框
                }
              })
          }
          else 
          {
            wx.hideLoading(); //关闭等待加载框
          }

          //将此人的信息从发热但未联系的数据集合FeverAndNotContacted中删除
          notContact.doc(id)
            .remove({
              complete(e) 
              {
                console.log("此人已退烧", e);
              }
            })

          page.setData({
            showNormalDialog: !page.data.showNormalDialog, //打开体温正常通知窗口
            isFever: false,   //储存未发热状态
            temp_value: ''    //清空体温输入框
          });
        }
      }
    }
    else //如果未设置体温测量方式
    {
      //显示提示
      wx.showModal({
        title: '提示',
        content: '请先设置测量方式',
        showCancel: false
      })

      page.setData({
        temp_value: '' //清空体温输入框
      });
    }
  },

  /***** 体温测量方式设置按钮点击事件 *****/

  setMethod() 
  {
    let page = this;
    
    //打开下拉列表
    wx.showActionSheet({
      itemList: ['腋温测量', '口温测量', '耳温测量', '额温测量'], //设置选项文本
      success(res)  //选择测量方式后
      {
        switch (res.tapIndex) 
        {

          //设为腋温测量模式
          case 0: page.setData({
                    measure_method: '腋温测量',
                    measure_method_id: res.tapIndex
                  });
                  break;

          //设为口温测量模式
          case 1: page.setData({
                    measure_method: '口温测量',
                    measure_method_id: res.tapIndex
                  });
                  break;

          //设为耳温测量模式
          case 2: page.setData({
                    measure_method: '耳温测量',
                    measure_method_id: res.tapIndex
                  });
                  break;

          //设为额温测量模式
          case 3: page.setData({
                    measure_method: '额温测量',
                    measure_method_id: res.tapIndex
                  });
                  break;
        }
        console.log(page.data.measure_method_id);
      },
      fail(res) 
      {
        console.log(res.errMsg)
      }
    })
  },

  /***** 点击体温正常窗口外侧事件 *****/

  toggleNormalDialog() 
  {
    //关闭体温正常窗口
    this.setData({
      showNormalDialog: !this.data.showNormalDialog
    });
  },

  /***** 点击体温正常窗口关闭事件 *****/

  closeNormalDialog() 
  {
    //关闭体温正常窗口
    this.setData({
      showNormalDialog: !this.data.showNormalDialog
    });
  },

  /***** 点击发热窗口关闭按钮事件 *****/

  closeFeverDialog() 
  {
    this.setData({
      showFeverDialog: !this.data.showFeverDialog, //关闭体温正常窗口
      temp_value: '',     //清空体温输入框
      showFeverTextNo: 0  //发热窗口内容页索引复位
    });
  },

  /***** 点击发热窗口上传数据按钮事件 *****/

  updateFeverDialog() 
  {
    var page = this;

    //如果待显示内容页索引为0
    if (page.data.showFeverTextNo==0)
    {
      wx.showLoading({
        title: '上传中',
        mask: true
      })

      //获取当前时间
      var timestamp = Date.parse(new Date());
      var date = Date(timestamp);

      //从后台数据库FeverAndNotContacted数据集合中，根据用户OpenID获取其记录
      notContact.where({
        _id: id
      })
      .get({
        complete: function (e) // 获取完成后
        {
          console.log(e);
          if (e.data.length != 0) //如果已有记录
          {
            console.log('有'); //不做操作
          }
          else //如果没有记录
          {
            notContact.add({ //添加新纪录
              data:
              {
                _id: id,                                //用户OpenID设为条目ID
                name: page.data.userName,               //用户姓名
                isStudent: page.data.userStudent,       //用户身份
                contact: page.data.userContact,         //用户联系方式
                emer: page.data.emerName,               //用户紧急联系人姓名
                emer_relation: page.data.emerRelation,  //用户与紧急联系人的关系
                emer_contact: page.data.emerContact,    //用户紧急联系人联系方式
                fever: true,                            //设置此用户为发热状态
                temp: page.data.temp_value,             //记录发热体温
                startDate: date                         //记录发热起始时间
              }
            })
            console.log('没有');
          }
        }
      })

      if (page.data.isFever) //如果用户之前已发热
      {
        appUserInfo.doc(id) //更新数据集GesundheitUserInfo中的用户数据
        .update({
          data:
          {
            temp: page.data.temp_value //仅更新发热体温
          },
          complete: function (e)
          {
            wx.hideLoading();
          }
        })

        page.setData({
          isFever: true //记录用户发热状态
        });
      }
      else  //如果用户之前未发热
      {
        appUserInfo.doc(id) //更新数据集GesundheitUserInfo中的用户数据
        .update({
          data:
          {
            temp: page.data.temp_value, //记录用户发热体温
            fever: true,                //设置此用户为发热状态
            startDate: date             //记录发热起始时间
          },
          complete: function (e)
          {
            wx.hideLoading();
          }
        })

        page.setData({
          isFever: true //记录用户发热状态
        });
      }

      page.setData({
        showFeverTextNo: page.data.showFeverTextNo + 1 //进入下一个界面
      });
    }
    else  //进入发热数据上传后的联系询问界面，此时此按钮替换为联络按钮
    {
      //从后台数据库FeverAndNotContacted数据集合中移除此用户记录，此用户已联系
      notContact.doc(id)
        .remove({
          complete(e) 
          {
            console.log("此人已联系", e);
          }
        })

      page.setData({
        showFeverDialog: !page.data.showFeverDialog,  //关闭发热弹窗
        temp_value: '',     //清空体温输入框
        showFeverTextNo: 0  //设置页面索引为初始页面
      });
    }
  },

  /***** 点击体温输入超界窗口外侧事件 *****/

  toggleMistakeDialog() 
  {
    //关闭体温输入超界窗口
    this.setData({
      showMistakeDialog: !this.data.showMistakeDialog
    });
  },

  /***** 点击体温输入超界窗口关闭事件 *****/

  closeMistakeDialog() 
  {
    //关闭体温输入超界窗口
    this.setData({
      showMistakeDialog: !this.data.showMistakeDialog
    });
  },

  /***** 点击体温输入错误窗口外侧事件 *****/

  toggleErrorDialog() 
  {
    //关闭体温输入错误窗口
    this.setData({
      showErrorDialog: !this.data.showErrorDialog
    });
  },

  /***** 点击体温输入错误窗口关闭事件 *****/

  closeErrorDialog() 
  {
    //关闭体温输入错误窗口
    this.setData({
      showErrorDialog: !this.data.showErrorDialog
    });
  },

  /***********************************************/
  /*
  /*                注册面板功能函数
  /*
  /***********************************************/

  /***** 点击授权配置按钮打开注册面板事件 *****/

  regBtnClick() {
    //打开注册处理面板
    this.setData({
      showRegDialog: !this.data.showRegDialog
    });
  },

  /***** 点击注册面板上完成按钮时间（注册面板关闭）*****/

  closeRegDialog() 
  {
    var page = this;

    //更新首页显示已注册用户数量
    wx.getSetting({
      success: function (res) 
      {
        if (res.authSetting['scope.userInfo']) //用户已注册
        {
          appUserInfo.count({ //获取总注册用户数
            success(e) 
            {
              page.setData({totalUserNum: e.total - 1}) //更新数据，刨除本用户
            }
          })
        }
        else //用户未注册
        {
          appUserInfo.count({ //获取总注册用户数
            success(e) 
            {
              page.setData({ totalUserNum: e.total }) //更新数据
            }
          })
        }
      }
    });

    //关闭用户注册面板
    this.setData({
      showRegDialog: !page.data.showRegDialog
    });
  },

  /***** 用户注册流程开启事件*****/

  bindGetUserInfo: function (res) 
  {
    //用户选择授权
    if (res.detail.userInfo) 
    {
      var page = this;

      page.setData({
        showNewUserDialog: !page.data.showNewUserDialog,    //打开用户注册流程面板
        showNewUserTextNo: page.data.showNewUserTextNo + 1, //设置用户注册流程为初始页
        userName: '',       //清空用户姓名
        userStudent: '',    //清空用户身份
        userVisa: '',       //清空用户护照号
        userContact: '',    //清空用户联系方式
        emer: '',           //清空用户紧急联系人姓名
        emer_relation: '',  //清空用户与紧急联系人关系
        emer_contact: '',   //清空紧急联系人联系方式
        isChinese: false,   //默认用户非中国籍
        isTeenager: true,   //默认用户是未成年
        isLicensed: false   //默认用户监护人未授权
      });

      //获取当前时间
      var timestamp = Date.parse(new Date());
      var date = Date(timestamp);

      //开始授权
      wx.showLoading({
        title: '授权中',
        mask: true
      })

      //将空用户数据存储于数据集合GesundheitUserInfo中
      appUserInfo.add({
        data:
        {
          _id: id,            //用户OpenID
          name: '',           //空用户姓名
          isStudent: '',      //空用户身份
          isChinese: false,   //默认用户非中国籍
          isTeenager: true,   //默认用户是未成年
          isLicensed: false,  //默认用户监护人未授权
          contact: '',        //空用户联系方式
          emer: '',           //空用户紧急联系人
          emer_relation: '',  //空用户与紧急联系人关系
          emer_contact: '',   //空紧急联系人联系方式
          fever: false,       //默认用户未发烧
          temp: 0,            //默认用户体温为空
          startDate: date,    //录入注册时间
        },
        success(e) 
        {
          console.log("添加成功", e);
          wx.hideLoading();

          page.setData({
            isDisabled: false,  //开启部分数据上传功能
            regText: "已注册"   //显示状态为已注册
          })
        }
      })

      //将用户信息添加入历史记录，位于数据集RegHistoryLog中
      historyLog.add({
        data:
        {
          _id: id,          //用户OpenID
          login_date: date, //注册时间
          logout_date: ''   //空注销时间
        },
        success(e) //如果添加成功，说明之前用户未注册过
        {
          console.log("注册时间添加成功", e);
        },
        fail(e) //如果添加失败，说明之前用户注册过
        {
          //根据用户OpenID更新注册记录
          historyLog.where({
            _id: id
          })
          .update({
            data:
            {
              login_date: date, //注册时间
              logout_date: ''   //空注销时间
            }
          })
        }
      });

      //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
      page.setData({ isHide: false });
    }
    else {
      //用户按了拒绝按钮，弹窗警告弹框
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，有些功能将无法使用，请授权后再试',
        showCancel: false,
        confirmText: '返回授权',

        success: function (res) 
        {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) 
          {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  },

  //点击用户注册流程面板左侧按钮事件
  closeNewUserDialog() 
  {
    let page = this;

    switch (page.data.showNewUserTextNo) //判断当前用户注册流程页面编号
    {
      //如果为初始页面，即国籍信息页，即选择非中国籍
      case 1: page.setData({
                showNewUserDialog: !page.data.showNewUserDialog, //关闭用户注册流程窗口
                showNewUserTextNo: 0  //复位用户注册流程页面编号
              });

              page.setData({
                isChinese: false //更新此人状态为非中国籍用户
              });

              //更新数据集合GesundheitUserInfo中的用户信息
              appUserInfo.doc(id)
                .update({
                  data:
                  {
                    isChinese: page.data.isChinese,
                    isTeenager: page.data.isTeenager,
                    isLicensed: page.data.isLicensed
                  },
                  complete(e) 
                  {
                    console.log("不是中国籍", e);
                  }
                })

              break;

      //如果为年龄信息页，即选择未成年
      case 2:  //进入下一页，即进入监护人授权页
              page.setData({
                showNewUserTextNo: page.data.showNewUserTextNo + 1
              });

              page.setData({
                isTeenager: true //更新此人状态为未成年用户
              });

              //更新数据集合GesundheitUserInfo中的用户信息
              appUserInfo.doc(id)
                .update({
                  data:
                  {
                    isChinese: page.data.isChinese,
                    isTeenager: page.data.isTeenager,
                    isLicensed: page.data.isLicensed
                  },
                  complete(e) 
                  {
                    console.log("未成年", e);
                  }
                })
                
              break;

      //如果为监护人授权页，即选择拒绝授权
      case 3: page.setData({
                showNewUserDialog: !page.data.showNewUserDialog, //关闭用户注册流程窗口
                showNewUserTextNo: 0  //复位用户注册流程页面编号
              });

              page.setData({
                isLicensed: false //更新此人状态为监护人未授权
              });

              //更新数据集合GesundheitUserInfo中的用户信息
              appUserInfo.doc(id)
                .update({
                  data:
                  {
                    isChinese: page.data.isChinese,
                    isTeenager: page.data.isTeenager,
                    isLicensed: page.data.isLicensed
                  },
                  complete(e) 
                  {
                    console.log("监护人未授权", e);
                  }
                })

              break;
    }
  },

  //点击用户注册流程面板右侧按钮事件
  nextNewUserDialog() 
  {
    let page = this;

    //获取当前时间
    var timestamp = Date.parse(new Date());
    var date = Date(timestamp);

    switch (page.data.showNewUserTextNo) //判断当前用户注册流程页面编号
    {
      //如果为初始页面，即国籍信息页，即选择中国籍
      case 1: page.setData({
                showNewUserTextNo: page.data.showNewUserTextNo + 1, //进入下一页，年龄信息页
              });

              page.setData({
                isChinese: true //更新此人状态为中国籍用户
              });

              //更新数据集合GesundheitUserInfo中的用户信息
              appUserInfo.doc(id)
                .update({
                  data:
                  {
                    isChinese: page.data.isChinese,
                    isTeenager: page.data.isTeenager,
                    isLicensed: page.data.isLicensed
                  },
                  complete(e) 
                  {
                    console.log("是中国籍", e);
                  }
                })

              break;

      //如果为年龄信息页，即选择成年
      case 2: page.setData({
                showNewUserTextNo: page.data.showNewUserTextNo + 2, //进入数据录入界面
              });

              page.setData({
                isTeenager: false, //更新此人状态为成年用户
                isLicensed: true   //成年用户无需监护人授权
              });

              //更新数据集合GesundheitUserInfo中的用户信息
              appUserInfo.doc(id)
                .update({
                  data:
                  {
                    isChinese: page.data.isChinese,
                    isTeenager: page.data.isTeenager,
                    isLicensed: page.data.isLicensed
                  },
                  complete(e) 
                  {
                    console.log("已成年", e);
                  }
                })
              
              break;

      //如果为监护人授权页，即选择同意授权
      case 3: page.setData({
                showNewUserTextNo: page.data.showNewUserTextNo + 1, //进入数据录入界面
              });

              wx.showLoading({
                title: '授权中',
                mask: true
              })

              page.setData({
                isLicensed: true //更新此人状态为监护人已授权
              });

              //将监护人授权信息添加进数据集合TeenagerLicense
              teenLics.add({
                data:
                {
                  _id: id,  //用户OpenID
                  parents: page.data.parentsName,       //监护人姓名
                  relation: page.data.parentsRelation,  //监护人与未成年用户之间的关系
                  idNum: page.data.parentsID            //监护人证件号码
                },
                success(e) 
                {
                  console.log("添加成功", e);
                  wx.hideLoading();
                }
              })

              //更新数据集合GesundheitUserInfo中的用户信息
              appUserInfo.doc(id)
                .update({
                  data:
                  {
                    isChinese: page.data.isChinese,
                    isTeenager: page.data.isTeenager,
                    isLicensed: page.data.isLicensed
                  },
                  complete(e) 
                  {
                    console.log("监护人已授权", e);
                  }
                })

              break;
    }
  },

  /***** 用户数据录入界面下一步点击事件 *****/

  nextInfoDialog() {
    var page = this;

    page.setData({
      showInfoTextNo: page.data.showInfoTextNo + 1  //进入下一步
    })
  },

  /***** 关闭用户数据录入事件 *****/

  closeInfoDialog() {
    var page = this;

    page.setData({
      showInfoTextNo: 0,    //重置新用户注册流程页面索引
      showNewUserTextNo: 0  //重置新用户信息录入流程页面索引
    })

    wx.showLoading({
      title: '正在注册',
      mask: true
    })

    //获取当前时间
    var timestamp = Date.parse(new Date());
    var date = Date(timestamp);

    //更新数据集合GesundheitUserInfo中的用户个人信息
    appUserInfo.doc(id)
      .update({
        data:
        {
          name: page.data.userName,               //用户姓名
          isStudent: page.data.userStudent,       //用户身份
          visa: page.data.userVisa,               //用户护照号
          contact: page.data.userContact,         //用户联系方式
          emer: page.data.emerName,               //用户紧急联系人姓名
          emer_relation: page.data.emerRelation,  //用户与紧急联系人关系
          emer_contact: page.data.emerContact,    //用户紧急联系人联系方式
          isChinese: page.data.isChinese,         //用户国籍信息
          isTeenager: page.data.isTeenager,       //用户成年信息
          isLicensed: page.data.isLicensed,       //用户监护人授权信息
          fever: false,                           //初始化用户未发热
          temp: 0,                                //初始化用户体温为空
          startDate: date,                        //初始化体温注册日期
        },
        complete(e) {
          console.log("信息完整", e);
          wx.hideLoading();
        }
      })

    page.setData({
      showInfoDialog: false,      //关闭新用户注册流程窗口
      showNewUserDialog: false    //关闭新用户数据录入窗口
    });
  },

  /***** 用户姓名输入绑定 *****/

  userNameInput: function (e) 
  {
    this.setData({
      userName: e.detail.value
    });
  },

  /***** 用户身份输入绑定 *****/

  userStudentInput: function (e) 
  {
    this.setData({
      userStudent: e.detail.value
    });
  },

  /***** 用户护照号输入绑定 *****/

  userVisaInput: function (e) 
  {
    this.setData({
      userVisa: e.detail.value
    });
  },

  /***** 用户联系方式输入绑定 *****/

  userContactInput: function (e) 
  {
    this.setData({
      userContact: e.detail.value
    });
  },

  /***** 用户紧急联系人姓名输入绑定 *****/

  emerNameInput: function (e) 
  {
    this.setData({
      emerName: e.detail.value
    });
  },

  /***** 用户与紧急联系人关系输入绑定 *****/

  emerRelationInput: function (e) 
  {
    this.setData({
      emerRelation: e.detail.value
    });
  },

  /***** 用户紧急联系人联系方式输入绑定 *****/

  emerContactInput: function (e) 
  {
    this.setData({
      emerContact: e.detail.value
    });
  },

  /***** 未成年用户监护人姓名输入绑定 *****/

  parentsNameInput: function (e) {
    this.setData({
      parentsName: e.detail.value
    })
  },

  /***** 未成年用户监护人关系输入绑定 *****/

  parentsRelationInput: function (e) {
    this.setData({
      parentsRelation: e.detail.value
    })
  },

  /***** 未成年用户监护人证件号输入绑定 *****/

  parentsIDInput: function (e) {
    this.setData({
      parentsID: e.detail.value
    })
  },

  /***** 用户信息变更事件 *****/

  //点击注册面板“信息”按钮
  setUserInfo() 
  {
    var page = this;

    wx.showLoading({
      title: '加载中',
      mask: true
    })

    //获取后台系统设置
    newMsg.where({
      _id: 'isUsable'
    })
    .get({
      success(e) 
      {
        if (e.data[0].usable) //如果数据录入功能可用
        {
          page.setData({
            showInfoDialog: true  //打开用户数据录入界面
          });
          wx.hideLoading();
        }
      }
    })
  },

  /***** 用户注销处理事件 *****/

  bindOpenSetting: function (res) 
  {
    var page = this;

    if (res.detail.authSetting['scope.userInfo']) //如果用户不选择注销
    {
      page.setData({
        isDisabled: false,    //开启数据上传功能
        regText: "已注册"     //显示状态为已注册
      })
    }
    else //如果用户选择注销
    {
      //开始注销流程
      wx.showLoading({
        title: '注销中',
        mask: true
      })

      page.setData
      ({
        isDisabled: true,   //关闭数据上传功能
        regText: "未注册"   //显示状态为未注册
      })

      //从数据集合GesundheitUserInfo中删除用户信息
      appUserInfo.doc(id)
        .remove({
          success(res) 
          {
            console.log("用户信息删除成功", res);

            //获取当前时间
            var timestamp = Date.parse(new Date());
            var date = Date(timestamp);

            //更新数据集合RegHistoryLog内的用户注销时间
            historyLog.where({
              _id: id
            })
            .update({
              data:
              {
                logout_date: date
              }
            })

            //从数据集合TeenagerLicense中删除用户监护人信息
            teenLics.doc(id)
              .remove({
                success(res) //删除成功
                {
                  console.log("监护人信息删除成功", res);
                  wx.hideLoading();
                },
                fail(res) //删除失败（成年用户）
                {
                  console.log("监护人信息删除失败", res);
                  wx.hideLoading();
                },
                complete(res) //删除结束
                {
                  //显示提醒
                  wx.showModal({
                    title: '提示',
                    content: '您的所有个人信息已从服务器删除。微信OpenID，及注册和注销时间记录将暂时保留30天，之后彻底清除',
                    showCancel: false,
                  })
                }
              })
          },
          fail(e) //删除失败
          {
            console.log("用户信息删除失败", e);
            wx.hideLoading();
          }
        })
    }
  },

  /***********************************************/
  /*
  /*              抗疫活动登记功能函数
  /*
  /***********************************************/

  /***** 抗疫活动登记用户姓名输入绑定 *****/

  applyNameInput: function (e) 
  {
    applyName = e.detail.value;
  },

  /***** 抗疫活动登记用户地址输入绑定 *****/

  applyAddrInput: function (e) 
  {
    applyAddr = e.detail.value;
  },

  /***** 抗疫活动登记用户邮编输入绑定 *****/

  applyPostInput: function (e) 
  {
    applyPost = e.detail.value;
  },

  /***** 抗疫活动登记用户联系方式输入绑定 *****/

  applyContactInput: function (e) 
  {
    applyContact = e.detail.value;
  },

  /***** 关闭抗疫活动登记窗口事件 *****/

  closeNewGoodsDialog() 
  {
    this.setData({
      showNewGoodsDialog: !this.data.showNewGoodsDialog //关闭此窗口，放弃登记参与此活动
    });
  },

  /***** 发送抗疫活动登记事件 *****/

  submitNewGoodsDialog() 
  {
    let page = this;

    wx.showLoading({
      title: '上传中',
      mask: true
    })

    //将活动参与登记添加至数据集GoodsApplications
    goodsApply.add({
      data:
      {
        _id: id,                //登记用户OpenID
        name: applyName,        //登记用户姓名
        post: applyPost,        //登记用户邮编
        city: page.data.city_array[page.data.city_index], //登记用户所在城市
        addr: applyAddr,        //登记用户地址
        contact: applyContact   //登记用户联系方式
      },
      success: function(e){ //登记成功
        wx.hideLoading();

        wx.showModal({
          title: '提示',
          content: '登记成功',
          showCancel: false
        })

        page.setData({
          showNewsDialog: !page.data.showNewsDialog //关闭登记窗口（即新消息通知窗口）
        });
      },
      fail: function (e) //登记失败，覆盖旧信息
      {
        wx.hideLoading();
        
        //提示用户曾登记过
        wx.showModal({
          title: '提示',
          content: '您已登记，新输入登记信息将覆盖旧信息，除非输入错误，请不要重复登记',
          showCancel: false
        })

        //更新用户登记信息
        goodsApply.where({
          _id: id
        })
        .update({
          data:
          {
            name: applyName,        //登记用户姓名
            post: applyPost,        //登记用户邮编
            city: page.data.city_array[page.data.city_index], //登记用户所在城市
            addr: applyAddr,        //登记用户地址
            contact: applyContact   //登记用户联系方式
          }
        })

        page.setData({
          showNewsDialog: !page.data.showNewsDialog //关闭登记窗口（即新消息通知窗口）
        });
      }
    })
  },

  /***** 发送抗疫活动登记城市选择事件 *****/

  bindPickerChange: function (e) {
    this.setData({
      city_index: e.detail.value
    })
  },

  /***********************************************/
  /*
  /*            系统初始消息弹窗功能函数
  /*
  /***********************************************/

  /***** 检测发热记录弹窗：用户选择联系事件 *****/

  contactstillFeverDialog() //在程序开启时检测到用户有发热数据上传，后用户选择与客服志愿者联系
  {
    
    //将此人从未联系名单中删除
    notContact.doc(id)
      .remove({
        complete(e) 
        {
          console.log("此人已联系", e);
        }
      })

    this.setData({
      showstillFeverDialog: !this.data.showstillFeverDialog //关闭窗口
    });
  },

  /***** 检测发热记录弹窗：点击窗口外事件 *****/

  togglestillFeverDialog() 
  {
    this.setData({
      showstillFeverDialog: !this.data.showstillFeverDialog //关闭窗口
    });
  },

  /***** 检测发热记录弹窗：关闭窗口事件 *****/

  closestillFeverDialog() 
  {
    this.setData({
      showstillFeverDialog: !this.data.showstillFeverDialog //关闭窗口
    });
  },

  /***** 新消息通知弹窗：点击窗口外事件 *****/

  toggleNewsDialog() 
  {
    this.setData({
      showNewsDialog: !this.data.showNewsDialog,
      newsShowing: false
    });
  },

  /***** 新消息通知弹窗：关闭窗口事件 *****/

  closeNewsDialog() 
  {
    let page = this;

    //如果有新抗疫活动登记信息，且目前正显示第一条信息
    if ((page.data.showNewsTextNo==0)&&(page.data.hasGoods) && (page.data.newsCurrentNum==1))
    {
      page.setData({
        showNewsTextNo: page.data.showNewsTextNo + 1 //进入抗疫活动登记界面
      });
      console.log(page.data.showNewsTextNo);
    }
    else //如果无新抗疫活动登记信息
    {
      page.setData({
        showNewsDialog: !page.data.showNewsDialog, //关闭新消息通知界面
        newsShowing: false,   //设置新消息通知界面状态为关闭
        showNewsTextNo: 0     //重置新消息页面索引
      });
      console.log(page.data.showNewsTextNo);
    }
  },

  /***** 新消息通知弹窗：点击下一个消息事件 *****/

  nextNewsDialog() 
  {
    let page = this;

    //获取新通知信息状态
    newMsg.where({
      _id: 'newMessage'
    })
    .get({
      complete(res) 
      {
        if (res.data[0].isNew) //如果新消息可用
        {
          //获取消息内容及编号
          page.setData({
            newsContent: res.data[0].msg[res.data[0].amount- 1],
            newsTotalNum: res.data[0].amount,
            newsCurrentNum: page.data.newsCurrentNum + 1
          });

          //如果看完所有信息，回归第一条
          if (page.data.newsCurrentNum > page.data.newsTotalNum)
          {
            page.setData({
              newsCurrentNum: 1
            });
          }

          //设置消息内容
          page.setData({
            newsContent: res.data[0].msg[res.data[0].amount - page.data.newsCurrentNum]
          });
        }
        else  //如果新消息正在更新
        {
          //发出提示
          wx.showModal({
            title: '提示',
            content: '系统后台正在更新通知，请稍后',
            showCancel: false,
          })

          //关闭新消息通知界面
          page.setData({
            showNewsDialog: !page.data.showNewsDialog,
            newsShowing: false
          });
        }
      }
    })
  }
})