"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
function execP(command) {
    return new Promise((resolve, reject) => {
        child_process_1.exec(command, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            resolve({ stdout, stderr });
        });
    });
}
function exist(fileName) {
    return fs_1.existsSync(path_1.resolve(fileName)) ? true : false;
}
function loadConf() {
    return JSON.parse(fs_1.readFileSync(path_1.resolve('package.json'), 'utf8'));
}
function prettier(remoteConf) {
    if (remoteConf) {
        if (remoteConf.prettier) {
            return {
                key: 'prettier',
                conf: remoteConf.prettier,
            };
        }
    }
    return {
        key: 'prettier',
        conf: {
            trailingComma: 'es5',
            tabWidth: 2,
            semi: false,
            singleQuote: true,
        },
    };
}
function bundler(ty) {
    const deps = [];
    switch (ty) {
        case 'webpack':
            deps.push('webpack', 'webpack-cli');
            break;
        case 'esbuild':
            deps.push('esbuild');
            break;
        default:
            deps.push('parcel');
    }
    return deps;
}
;
(() => __awaiter(void 0, void 0, void 0, function* () {
    if (!exist('package.json')) {
        yield execP('npm init -y');
        const localConf = loadConf();
        localConf.devDependencies = {};
        delete localConf.scripts.test;
        // Prettier
        localConf.prettier = prettier().conf;
        localConf.devDependencies.prettier = 'latest';
        // Bundler
        bundler().forEach((e) => (localConf.devDependencies[e] = 'latest'));
        // TS
        localConf.devDependencies.typescript = 'latest';
        // Rewrite package.json
        fs_1.writeFileSync(path_1.resolve('package.json'), JSON.stringify(localConf));
        // Install deps
        yield execP('npm install');
        // Format package.json
        yield execP('npx prettier -w package.json');
        console.log('✨ Done: ready to go!');
    }
    else {
        console.log('📌 Note: package.json exists!');
    }
}))();
