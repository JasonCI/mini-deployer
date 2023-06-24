import axios from 'axios'
import fs from 'fs-extra'
import {md5} from "../utils/git";
import {Env, MarkdownMessageData, NewsNoticeMessageData, SenderConfig} from "../types";

const HOOK_URL = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send'
const request = axios.create({
    headers: {
        "Content-Type": "application/json"
    }
})

export default class MsgSender {
    config: SenderConfig = {wecom: {prodKey: '', devKey: ''}}

    constructor(cfg: SenderConfig) {
        const {wecom: {prodKey = "", devKey = ""}} = cfg
        if (!prodKey || !devKey) {
            throw new Error('请配置企业微信机器人的key')
        }
        this.config = Object.assign({}, this.config, cfg)
    }

    async sendImg(imgPath: string = '', env: Env = 'prod') {
        const key = env === 'prod' ? 'prodKey' : 'devKey'
        await sendImgMsg(imgPath, this.config.wecom[key])
    }

    async sendMarkdown(data: MarkdownMessageData, content: string, env: Env = 'prod') {
        const key = env === 'prod' ? 'prodKey' : 'devKey'
        await sendMarkdownMsg(data, content, this.config.wecom[key])
    }

    async sendNews(data: NewsNoticeMessageData, env: Env = 'prod') {
        const key = env === 'prod' ? 'prodKey' : 'devKey'
        await sendNewsNotice(data, this.config.wecom[key])
    }

    async sendFile(filePath: string, env: Env = 'prod') {
        const key = env === 'prod' ? 'prodKey' : 'devKey'
        await sendFileMsg(filePath, this.config.wecom[key])
    }
}

// 发送图片信息
async function sendImgMsg(imgPath: string, accessKey: string) {
    let result
    try {
        const bitmap = await fs.readFileSync(imgPath)
        const base64 = Buffer.from(bitmap).toString('base64')
        const imgMd5 = md5(bitmap)
        const res = await request.post(`${HOOK_URL}?key=${accessKey}`, {
            msgtype: 'image',
            image: {
                base64: base64, // 图片内容的base64编码
                md5: imgMd5, // 图片内容（base64编码前）的md5值
            },
        })
        const {errcode} = res.data
        if (errcode === 0) {
            console.log(`发送企业微信二维码图片成功`, res.data)
        }
        result = res.data
    } catch (e) {
        console.error(`发送企业微信二维码图片失败，原因${e}`)
    }
    return result
}

// 发送markdown信息
async function sendMarkdownMsg(data: MarkdownMessageData, content: string, accessKey: string) {
    const {name = '', version = '', gitHash = '', buildId = '', branch = '', gitCommit = []} = data
    try {
        let commitText = ''
        if (Array.isArray(gitCommit)) {
            gitCommit.forEach((gItem) => {
                commitText += gItem + '\n'
            })
        }
        const res = await request.post(`${HOOK_URL}?key=${accessKey}`, {
            msgtype: 'markdown',
            markdown: {
                content: `【${name}】<font color=\"info\">发布成功</font>。\n \
                    应用版本: <font color=\"comment\">${version}</font> \n \
                    git分支: <font color=\"comment\">${branch}</font> \n \
                    buildId: <font color=\"comment\">${buildId}</font> \n \
                    gitHash: <font color=\"comment\">${gitHash}</font> \n \
                    提交摘要：<font color=\"comment\">${commitText}</font>`,
            },
        })
        const {errcode} = res.data
        if (errcode === 0) {
            console.log(`发送企业微信成功`)
        }
    } catch (e) {
        console.error(`发送企业微信失败，原因${e}`)
    }
}

async function sendNewsNotice(data: NewsNoticeMessageData, accessKey: string) {
    const {name, version, appId, buildId, compiledResultPath, sourceMapSavePath, qrcodeOutputDest, branch, url} = data
    const sourceMediaId = sourceMapSavePath ? await getMediaId(sourceMapSavePath, accessKey) : ''
    const codeMediaId = compiledResultPath ? await getMediaId(compiledResultPath, accessKey) : ''
    const qrCodeMediaId = qrcodeOutputDest ? await getMediaId(qrcodeOutputDest, accessKey) : ''
    try {
        let commitText = ''
        if (Array.isArray(data.gitCommit)) {
            data.gitCommit.forEach((gItem: string) => {
                commitText += gItem + '\n'
            })
        }
        const json = {
            msgtype: 'template_card',
            template_card: {
                card_type: 'news_notice',
                source: {
                    icon_url: 'https://i.imgur.com/La05Koo.png',
                    desc: 'jenkins发布通知',
                    desc_color: 0,
                },
                main_title: {
                    title: name,
                    desc: '',
                },
                card_image: {
                    url: 'https://wework.qpic.cn/wwpic/354393_4zpkKXd7SrGMvfg_1629280616/0',
                    aspect_ratio: 2.25,
                },
                vertical_content_list: [
                    {
                        title: '更新信息摘要',
                        desc: commitText,
                    },
                ],
                horizontal_content_list: [
                    {
                        keyname: '应用版本',
                        value: version,
                        type: 0,
                        media_id: undefined
                    },
                    {
                        keyname: '发布分支',
                        value: branch,
                        type: 0,
                    },
                    {
                        keyname: '构建ID',
                        value: buildId,
                        type: 0,
                    },
                ],
                card_action: {
                    type: appId ? 2 : 1,
                    appid: appId,
                    url,
                },
            },
        }
        if (sourceMediaId) {
            json.template_card.horizontal_content_list.push({
                keyname: 'source-map',
                value: 'map.zip',
                type: 2,
                media_id: sourceMediaId,
            })
        }
        if (qrCodeMediaId) {
            json.template_card.horizontal_content_list.push({
                keyname: '预览二维码',
                value: 'qrcode.jpg',
                type: 2,
                media_id: qrCodeMediaId,
            })
        }
        if (codeMediaId) {
            json.template_card.horizontal_content_list.push({
                keyname: '编译代码',
                value: 'code.zip',
                type: 2,
                media_id: codeMediaId,
            })
        }
        const res = await request.post(`${HOOK_URL}?key=${accessKey}`, json)
        const {errcode, errmsg} = res.data
        if (errcode === 0) {
            console.log(`发送企业微信成功`)
            return
        }
        console.error(`发送企业微信失败，原因${errmsg}`)
    } catch (e) {
        console.error(`发送企业微信失败，原因${e}`)
    }
}

// 发送文件信息
// 1、前提先调用企业微信上传文件接口，返回media_id
// 2、拿media_id发送文件消息，仅三天内有效期
async function sendFileMsg(filePath: string, accessKey: string) {
    if (!filePath) return
    try {
        let media_id = await getMediaId(filePath, accessKey)
        const res = await request.post(`${HOOK_URL}?key=${accessKey}`, {
            msgtype: 'file',
            file: {
                media_id,
            },
        })
        console.log(`发送文件信息成功`, res.data)
    } catch (e) {
        console.error(`发送文件信息失败，原因${e}`)
    }
}

const getMediaId = async (filePath: string, accessKey: string) => {
    if (!filePath) return null
    try {
        let result = await uploadFile(filePath, accessKey)
        const {errcode, media_id} = result
        if (errcode === 0 && media_id) {
            return media_id
        }
    } catch (e) {
        console.error(`发送文件信息失败，原因${e}`)
    }
}

async function uploadFile(filePath: string, accessKey: string) {
    const url = `https://qyapi.weixin.qq.com/cgi-bin/webhook/upload_media?key=${accessKey}&type=file`
    const res = await request.post(url, {
        formData: {
            name: 'media',
            file: fs.createReadStream(filePath),
        },
    }, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
    return res.data
}

export {
    sendImgMsg,
    sendMarkdownMsg,
    sendFileMsg,
    sendNewsNotice,
}