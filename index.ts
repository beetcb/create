#!/usr/bin/env node
import yargs from 'yargs'
import fetch from 'node-fetch'
import { exec } from 'child_process'
import { resolve } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'

type Arguments = {
  bundler?: string
  remote?: string
  ts?: boolean
}

type PkgConf = {
  [key: string]: any
}

type ModuleConf = {
  key: string
  conf: object
}

function execP(
  command: string
): Promise<{
  stdout: string
  stderr: string
}> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error)
      }
      resolve({ stdout, stderr })
    })
  })
}

function exist(fileName: string) {
  return existsSync(resolve(fileName)) ? true : false
}

async function loadConf(remote?: string): Promise<PkgConf> {
  if (remote) {
    const data = await fetch(remote)
    return await data.json()
  } else if (typeof remote === 'string') {
    return {}
  }
  return JSON.parse(readFileSync(resolve('package.json'), 'utf8'))
}

function prettier(remoteConf?: PkgConf): ModuleConf {
  if (remoteConf) {
    if (remoteConf.prettier) {
      return {
        key: 'prettier',
        conf: remoteConf.prettier,
      }
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
  }
}

function getBundler(ty?: string) {
  const deps: Array<string> = []
  switch (ty) {
    case 'webpack':
      deps.push('webpack', 'webpack-cli')
      break
    case 'esbuild':
      deps.push('esbuild')
      break
    default:
      deps.push('parcel')
  }
  return deps
}

function cmdInterface(): Arguments {
  return yargs(process.argv.slice(2)).options({
    bundler: { type: 'string' },
    remote: { type: 'string' },
    ts: { type: 'boolean' },
  }).argv
}

;(async () => {
  if (!exist('package.json')) {
    await execP('npm init -y')
    const localConf: PkgConf = await loadConf()
    localConf.devDependencies = {}
    delete localConf.scripts.test

    // Parse args
    const { bundler, remote, ts } = cmdInterface()

    // LoadRemoteConf
    const remoteConf = await loadConf(remote || '')

    // TS
    if (ts) localConf.devDependencies.typescript = 'latest'

    // Scripts
    if (remoteConf.scripts) localConf.scripts = remoteConf.scripts

    // Prettier
    localConf.prettier = prettier(remoteConf).conf
    localConf.devDependencies.prettier = 'latest'

    // Bundler
    getBundler(bundler).forEach((e) => (localConf.devDependencies[e] = 'latest'))

    // Rewrite package.json
    writeFileSync(resolve('package.json'), JSON.stringify(localConf, null, 2))

    console.log('✨ Done: ready to go!')
  } else {
    console.log('📌 Note: package.json exists!')
  }
})()
