// 发送文本格式
export interface TextMessage {
    msgtype: "text";
    text: {
        content: string; // 文本内容
    };
}

// 发送图片格式
export interface ImageMessage {
    msgtype: "image";
    image: {
        mediaid: string; //图片的素材id
    };
}

// 发送视频格式
export interface MarkdownMessageData {
    name:string
    version:string
    gitHash:string
    buildId:string
    branch:string
    gitCommit:string[]
}
export interface NewsNoticeMessageData {
    name:string
    version:string
    gitHash:string
    buildId:string
    compiledResultPath:string
    sourceMapSavePath:string
    qrcodeOutputDest:string
    branch:string
    gitCommit:string[]
}

// 发送文件格式
export interface FileMessage {
    msgtype: "file";
    file: {
        mediaid: string; //文件的素材id
    };
}

export interface SenderConfig {
    wecom:{
        prodKey:string, // 企业微信机器人的key - 生产
        devKey:string, // 企业微信机器人的key - 测试
    }
}

export interface DeployConfig {
    isProd:boolean
    wx?:{
        name : string,
        appId: string,
        privateKeyPath: string,
        version:string,
        projectPath:string
    },
    alipay?:{
        name : string,
        appId: string,
        toolId: string,
        privateKey: string,
        version:string,
        projectPath:string
    }
}
export interface MsgSender {

}
export interface MiniDeployClass {

}
export type Env = 'prod'|'dev'