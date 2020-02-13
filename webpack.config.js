const   rmrf = require('fs-extra').removeSync,
        copy = require('fs-extra').copySync,
        watchFolder = require('fs-extra').watch,
        watchFile = require('fs-extra').watchFile;

rmrf(__dirname+'/dist');
rmrf(__dirname+'/api');
copy(__dirname+'/src/manifest.json', __dirname+'/dist/manifest.json');
copy(__dirname+'/src/assets', __dirname+'/dist/assets');

const buildConfig = {
    entry: {
        contentscript: [__dirname+'/src/context/content/Content.ts'],
        background: [__dirname+'/src/context/background/Background.ts'],
        popup: [__dirname+'/src/context/popup/Popup.ts'],
        contenthook: [__dirname+'/src/context/content/ContentHook.ts'],
        options: [__dirname+'/src/context/options/Options.ts']
    },
    devtool: 'source-map',
    module: {
    rules: [
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        },
        {
            test: /\.m?js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                presets: ['@babel/preset-env']
                }
            }
        },
    ]
    },
    resolve: {
        extensions: [ '.ts', 'tsx', '.js' ]
    },
    output: {
        filename: '[name].bundle.js',
        path: __dirname+'/dist'
    },
    target: 'web',
    mode: 'development'
}

if(process.argv[process.argv.length - 1] == '--mode=development') {
    buildConfig.watch = true;
    watchFolder(__dirname+'/src/assets', {recursive: true}, () => {
        copy(__dirname+'/src/assets', __dirname+'/dist/assets');
    })
    watchFile(__dirname+'/src/manifest.json', {}, () => {
        copy(__dirname+'/src/manifest.json', __dirname+'/dist/manifest.json');
    })
} else {
    buildConfig.mode = 'production';
    delete buildConfig.devtool;
}

module.exports = [buildConfig];

