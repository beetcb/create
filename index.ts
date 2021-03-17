import { exec } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

export type Bundler = 'parcel' | 'esbuild' | 'webpack'
export type PkgConf = {
  [key: string]: any
}

export type ModuleConf = {
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

function loadConf() {
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

function bundler(ty?: Bundler) {
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

;(async () => {
  if (!exist('package.json')) {
    await execP('npm init -y')
    const localConf: PkgConf = loadConf()
    localConf.devDependencies = {}
    delete localConf.scripts.test

    // Prettier
    localConf.prettier = prettier().conf
    localConf.devDependencies.prettier = 'latest'

    // Bundler
    bundler().forEach((e) => (localConf.devDependencies[e] = 'latest'))

    // TS
    localConf.devDependencies.typescript = 'latest'

    // Rewrite package.json
    writeFileSync(resolve('package.json'), JSON.stringify(localConf))

    // Install deps
    await execP('npm install')

    // Format package.json
    await execP('npx prettier -w package.json')

    console.log('✨ Done: ready to go!')
  } else {
    console.log('📌 Note: package.json exists!')
  }
})()
