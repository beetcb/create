#!/usr/bin/env node
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const child_process_1 = require("child_process");
const path_1 = require("path");
const fs_1 = require("fs");
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
function loadConf(remote) {
    return __awaiter(this, void 0, void 0, function* () {
        if (remote) {
            const data = yield node_fetch_1.default(remote);
            return yield data.json();
        }
        else if (typeof remote === 'string') {
            return {};
        }
        return JSON.parse(fs_1.readFileSync(path_1.resolve('package.json'), 'utf8'));
    });
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
function getBundler(ty) {
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
function cmdInterface() {
    return yargs_1.default(process.argv.slice(2)).options({
        bundler: { type: 'string' },
        remote: { type: 'string' },
        ts: { type: 'boolean' },
    }).argv;
}
;
(() => __awaiter(void 0, void 0, void 0, function* () {
    if (!exist('package.json')) {
        yield execP('npm init -y');
        const localConf = yield loadConf();
        localConf.devDependencies = {};
        delete localConf.scripts.test;
        // Parse args
        const { bundler, remote, ts } = cmdInterface();
        // LoadRemoteConf
        const remoteConf = yield loadConf(remote || '');
        // TS
        if (ts)
            localConf.devDependencies.typescript = 'latest';
        // Scripts
        if (remoteConf.scripts)
            localConf.scripts = remoteConf.scripts;
        // Prettier
        localConf.prettier = prettier(remoteConf).conf;
        localConf.devDependencies.prettier = 'latest';
        // Bundler
        getBundler(bundler).forEach((e) => (localConf.devDependencies[e] = 'latest'));
        // Rewrite package.json
        fs_1.writeFileSync(path_1.resolve('package.json'), JSON.stringify(localConf, null, 2));
        console.log('✨ Done: ready to go!');
    }
    else {
        console.log('📌 Note: package.json exists!');
    }
}))();
