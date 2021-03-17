import { exec } from 'child_process'
import { existsSync } from 'fs'
import { resolve } from 'path'

export type Bundler = 'parcel' | 'esbuild' | 'webpack'

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

function prettier(): { key: string; conf: object } {
  return {
    key: 'prettier',
    conf: {
      trailingComma: 'es6',
      tabWidth: 2,
      semi: false,
      singleQuote: true,
    },
  }
}

function bundler(ty: Bundler) {}
