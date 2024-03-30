import ci from "miniprogram-ci";
import {DeployConfig} from "../types";
import {getGitCommit} from "../utils/git";
import {join} from "path";

export default class MiniDeploy {
    project: ci.Project
    config: DeployConfig
    setting = {
        es6: false, // "es6 转 es5"
        es7: false, // "增强编译"
        minify: true, // "压缩代码"
        codeProtect: false, // "代码保护"
        autoPrefixWXSS: true, // "样式自动补全"
    }
    compiledResultPath = ''
    sourceMapSavePath = ''
    qrcodeOutputDest = ''

    constructor(config: DeployConfig) {
        const {isProd, wx, compiledResultPath, sourceMapSavePath, qrcodeOutputDest} = config
        if (!wx) {
            throw new Error('请配置微信小程序的相关信息')
        }
        this.compiledResultPath = compiledResultPath;
        this.sourceMapSavePath = sourceMapSavePath;
        this.qrcodeOutputDest = qrcodeOutputDest;
        this.config = config
        const {name, appId, privateKeyPath, version, projectPath} = wx
        this.project = new ci.Project({
            appid: appId,
            type: 'miniProgram',
            projectPath,
            privateKeyPath,
            ignores: ['node_modules/**/*', '.*'],
        })
    }

    async upload() {
        const {project} = this
        const {version} = this.config?.wx!
        const commits = await getGitCommit('./')
        const desc = commits[0]
        await ci.upload({
            project,
            version,
            desc,
            setting: this.setting,
            onProgressUpdate: console.log,
        })
    }

    async genCode() {
        const {project, compiledResultPath, sourceMapSavePath} = this
        const {version} = this.config?.wx!
        const commits = await getGitCommit('./')
        const desc = commits[0]
        await ci.getCompiledResult(
            {
                project,
                version,
                desc,
                setting: this.setting,
                onProgressUpdate: console.log,
            },
            compiledResultPath
        )
        if (sourceMapSavePath) {
            await ci.getDevSourceMap({
                project,
                robot: 1,
                sourceMapSavePath,
            })
        }
    }

    async genQrcode() {
        const {project, qrcodeOutputDest} = this
        const {version} = this.config?.wx!
        const commits = await getGitCommit('./')
        const desc = commits[0]
        await ci.preview({
            project,
            desc: commits[0],
            setting: this.setting,
            qrcodeFormat: 'image',
            qrcodeOutputDest,
            version,
            onProgressUpdate: console.log,
        })
    }
}