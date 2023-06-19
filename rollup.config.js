import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript'
import externals from "rollup-plugin-node-externals";
// import babel from "@rollup/plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import clear from 'rollup-plugin-clear'
import terser from '@rollup/plugin-terser';

export default {
    input: './src/index.ts', // 入口文件
    output: [
        {
            format: 'cjs', // 打包为commonjs格式
            file: 'dist/mini-deployer.cjs', // 打包后的文件路径名称
            name: 'mini-deployer' // 打包后的默认导出文件名称
        },
        {
            format: 'esm', // 打包为esm格式
            file: 'dist/mini-deployer.esm.js',
            name: 'mini-deployer'
        },
        {
            format: 'umd', // 打包为umd通用格式
            file: 'dist/mini-deployer.umd.js',
            name: 'mini-deployer',
            minifyInternalExports: true
        }
    ],
    plugins: [
        clear({
            targets: ['dist']
        }),
        resolve(),
        externals({
            devDeps: false,
        }),
        commonjs({
            include: 'node_modules/**'
        }), // 将 CommonJS 转换成 ES2015 模块供 Rollup 处理
        // babel({ babelHelpers: "bundled" }), // babel配置,编译es6
        typescript({tsconfig: './tsconfig.json'}),
        // terser()
    ]
}
