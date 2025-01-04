/**
 * webpack配置文件
 * 用于将ES6模块化代码打包成浏览器可用的格式
 */
const path = require('path');

module.exports = {
    // 入口配置 - 直接对应现有js文件
    entry: {
        admin: path.resolve(__dirname, 'static/pages/admin/js/dashboard.js'),
        components: path.resolve(__dirname, 'static/js/components/base/base-component.js')
    },

    // 输出配置 - 保持在原有目录结构中
    output: {
        path: path.resolve(__dirname, 'static/dist'),
        filename: '[name].bundle.js',
        // 清理目录
        clean: true
    },

    // 模块规则
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },

    // 外部依赖声明
    externals: {
        'jquery': 'jQuery',
        'bootstrap': 'bootstrap'
    },

    // 开发工具配置
    devtool: 'source-map',

    // 解析配置
    resolve: {
        // 设置别名,方便导入
        alias: {
            '@components': path.resolve(__dirname, 'static/js/components'),
            '@utils': path.resolve(__dirname, 'static/js/components/utils'),
            '@stores': path.resolve(__dirname, 'static/js/components/stores')
        }
    }
};