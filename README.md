# mini-deployer

小程序发布助手，可配合jenkins自动发布使用

1. 支持微信小程序打包上传，生产source map 预览二维码。
2. 支持发送企业微信消息，支持文本消息，图片消息，文件消息，卡片消息
...


实例

```js
const { MiniDeploy, MsgSender, GitTools } = require('mini-deployer/dist/mini-deployer.cjs')
const fs = require('fs')


const packageJson = JSON.parse(fs.readFileSync('./package.json'))
const version = packageJson.version

const deployer = new MiniDeploy({
    isProd: true, 
    compiledResultPath : './dist/build/code.zip', // 上传的代码包
    sourceMapSavePath : './dist/build/map.zip', // 对应包的source map
    qrcodeOutputDest : './dist/build/qrcode.jpg', //预览二维码
    wx: {
        name: '小程序', // 小程序名称
        appId: 'wx1234567890',//   
        projectPath: './dist/build', // 包根目录
        privateKeyPath:'path/to/privateKey',// 上传密钥
        version:'1.0.0', // 版本
    },
})

const sender = new MsgSender({
        wecom: {
            prodKey: '123456789-536f-4c79-aa28-123456789', // 企业微信bot id，生产群
            devKey: '123456789-536f-4c79-aa28-123456789',// 企业微信bot id，开发群
  },
})

;(async () => {
    await deployer.genCode() // 打包代码
    await deployer.genQrcode() // 预览二维码
    await deployer.upload() // 上传代码
    const commits = await GitTools.getGitCommit('./') // 取最近三次提交信息 （摘要-hash -提交人）
    // 通知相关信息
    const notifyData = {
        name: '小程序',
        version,
        gitCommit: commits,
        buildId,
        branch,
        appId: appid,// 卡片消息必须
    }
    if (isProd) {
        notifyData.compiledResultPath = deployer.compiledResultPath
        notifyData.sourceMapSavePath = deployer.sourceMapSavePath
        notifyData.qrcodeOutputDest = deployer.qrcodeOutputDest
    }
    await sender.sendNews(notifyData, isProd ? 'prod':'dev')
    await sender.sendImg('path/to/img', isProd ? 'prod':'dev')
    await sender.sendFile('path/to/file', isProd ? 'prod':'dev')

    await sender.sendMarkdown(notifyData, isProd ? 'prod':'dev')
})()
```


后续准备再增加支付宝小程序发布