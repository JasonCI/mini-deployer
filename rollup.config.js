import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript'
import externals from "rollup-plugin-node-externals";
import babel from "@rollup/plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import terser from '@rollup/plugin-terser';
export default {
    input: './src/index.ts', // 入口文件
    output: {
        format: 'esm', // 打包为esm格式
        name: 'mini-deployer',
        exports: "named",
        dir: './dist',
        preserveModules: true, // 保留模块结构
        preserveModulesRoot: 'src', // 将保留的模块放在根级别的此路径下
    },
    plugins: [
        resolve(),
        externals({
            devDeps: false,
        }),
        commonjs(), // 将 CommonJS 转换成 ES2015 模块供 Rollup 处理
        babel({ babelHelpers: "bundled" }), // babel配置,编译es6
        typescript({tsconfig: './tsconfig.json'}),
        terser()
    ]
}
