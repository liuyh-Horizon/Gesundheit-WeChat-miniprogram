# Gesundheit留德华人华侨抗疫互助平台-微信小程序

## 程序简介

德国疫情日益严重，然而在德华人华侨分部较为分散，如有紧急情况较难取得帮助。常见的社交软件联系方式，如微信群等，因人数限制，很难一次性覆盖所有华人华侨留学生群体，需建立多个群组，加大管理通知难度。同时群内公聊隐私程度较低，如果求助者希望一对一联系，需要加好友，操作复杂。因此为了解决上述问题，方便同胞求助，设计了本微信小程序。本小程序运行于微信平台，无需下载安装。所有数据均存储于微信云开发平台，腾讯公司微信云开发平台保证其安全性。<br><br>

由于本人之前并未接触过小程序开发，本项目是在15天里边学边做中进行的，代码难免有冗余或不够简练的地方，请大家谅解<br><br>

## 功能模块

本程序分为**五大功能模块**：

* **在线/留言求助**：利用微信云开发平台的在线客服联络系统，可以添加100位志愿者作为在线客服，实时为求助者提供联络服务。也可以通过留言功能向后台发送信息，管理者可通过微信云数据库统一调取。

* **发热体温报告/追踪**：提供四种测量方式的体温数据核验功能，当不清楚所用测温方式（如耳温，口温）的发热温度时，可用本功能核验。提示可能发热时询问是否上传数据库，及是否联系志愿者客服。后台可通过数据库发现哪些用户上传了发热数据，以及哪些用户上传了但未联系。

* **新消息通知**：当可能参与合作的学联，华人华侨组织，使领馆方需要发送通知时，可在用户打开本程序时自动跳出。除了一般的防疫信息外，还可发布防疫活动（如物资分发）的登记通知。程序打开后也会以5分钟为一周期检查后台是否有新通知，有则自动弹出。

* **联系方式登记**：注册本小程序时可根据自愿原则填写一部分个人联络信息，授权流程遵循欧盟GDPR数据保护法规相关规定。可用于志愿者在提供帮助时与求助者联系。

* **防疫物资分发或者其他事件参与登记**：当学联，使领馆组织防疫相关活动需要登记时，可通过消息通知后弹出的登记窗口收集参与者信息。一人只可登记一次，重复输入只会覆盖旧信息。参与者所在城市会被限定在几个选择内。<br><br>

理论上来说，本程序只要购买足够的微信云资源，即可支撑无限量的用户访问，且成本不高（104元/月的专业初级资源包可支撑每天50万次数据传输操作）。因此，只需将100位招募的志愿者，和各地学联，华人组织集合在一个微信群组内，即可起到数据中心的作用。接收全德国各地的同胞求助，并分配给当地的组织或志愿者提供帮助。<br>

本程序的设计已严格遵守欧盟GDPR数据保护法相关要求，仅收集必要数据，且任何数据上传前都已获取用户授权，并为用户提供随时的删改操作选择。具体数据授权及风险协议，及详细的使用和功能说明，见文末参考文档。<br>


## 程序部署

本小程序运行于微信小程序平台，具体如何上传发布，请参考[微信小程序平台官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/) <br><br>

**注意：**<br>
本小程序在微信开发环境中建立项目时，务必选择微信云项目并进行如下几步：<br><br>

1) 在云开发数据数据库中建立如下数据集合：<br><br>

* GesundheitUserInfo：此数据集合存储所有注册用户的个人信息，包括联系信息及体温数据。
* FeverAndNotContacted：此数据集合存储所有选择上传发热体温数据，但未与志愿者取得联系的用户id。
* HelpMessage：此数据集合存储所有留言求助信息。
* TeenagerLicense：此数据集合存储所有未成年用户的监护人授权信息。
* RegHistoryLog： 此数据集合存储所有用户的注册和注销时间，在注销后仍保持30天，以防可能的法律纠纷。
* GoodsApplications：此数据集合存储所有抗疫活动参与登记者的信息。
* NewMessage：此数据集合为后台控制数据，包括新通知更新，抗疫活动开启，个人数据收集功能开关。<br><br>

2) 其中，NewMessage数据集合需提前预建3个条目及相应字段：<br><br>

* **"newMessage"**: 新消息控制，包括如下字段：<br><br>
  *_id*: "newMessage", //条目ID <br>
  *amount*: 0, //数值，新消息数量 <br>
  *cities*: ["", "", ...], //字符串数组，抗疫活动可登记城市 <br>
  *hasGoods*: false, //布尔型，是否有抗疫活动 <br>
  *isNew*: false, //布尔型，是否有新消息需要通知 <br>
  *msg*: ["", "", ...], //字符串数组，新消息内容 <br><br>

* **"newsNo"**: 新消息版本号， 包括如下字段：<br><br>
  *_id*: "newsNo", //条目ID <br>
  *no*: 0, //数值，新消息版本号<br><br>

* **"isUsable"**: 数据上传功能开关， 包括如下字段：<br><br>
  *_id*: "isUsable", //条目ID <br>
  *usable*: true, //布尔型，是否使数据上传功能<br><br>

3) 除了上述数据库设置外，在小程序项目内，还需上传cloudfunctions中的两个云函数：'getOpenid'和'cleanHelpMessage'。在其目录上右键，选择'上传并部署，云端安装依赖'。<br>

## 祝愿

希望这个小程序可以帮助到大家，希望大家都可以渡过难关，希望大家保重身体，一起等到可以再次自由出行的日子！<br>

## 参考文档

- [功能及使用说明](https://github.com/liuyh-Horizon/Gesundheit-WeChat-miniprogram/blob/master/Gesundheit%E7%95%99%E5%BE%B7%E5%8D%8E%E4%BA%BA%E5%8D%8E%E4%BE%A8%E6%8A%97%E7%96%AB%E4%BA%92%E5%8A%A9%E5%B9%B3%E5%8F%B0%E5%8A%9F%E8%83%BD%E5%8F%8A%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%E4%B9%A6.pdf)
点击连接下载或直接打开即可

- [操作视频](https://github.com/liuyh-Horizon/Gesundheit-WeChat-miniprogram/blob/master/%E6%93%8D%E4%BD%9C%E8%A7%86%E9%A2%91.mp4) 此视频为简单操作演示，仅供参考
