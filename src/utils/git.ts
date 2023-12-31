import execa from 'execa';
import * as crypto from "crypto";
const gitlog = require("gitlog").default;

// 字符串生成md5
export const md5 = (str: Buffer): string => {
    const md5 = crypto.createHash('md5')
    return md5.update(str).digest('hex')
}

// 获取当前git的hash版本号
export const getGitHash = async () => {
    const res = await execa('git rev-parse --short HEAD')
    return res.stdout
}

// 获取当前分支名称
export const getGitBranch = async () => {
    const res = await execa('git rev-parse --abbrev-ref HEAD')
    return res.stdout
}

type Commit = {
    abbrevHash: string, subject: string, authorName: string
}
// 获取Git提交记录
export const getGitCommit = async (dirPath: string,number= 3) => {
    // Git 提交信息
    const aCommits: Commit[] = gitlog({
        repo: dirPath,
        number,
        fields: [ 'subject', 'authorName'],
        execOptions: { maxBuffer: 1000 * 1024 },
    })
    const commits = aCommits.map(({ subject, authorName }: Commit) => {
        return `${subject} - ${authorName}`
    })
    return commits
}

export const GitTools = {
    getGitCommit, getGitBranch, getGitHash, md5
}
