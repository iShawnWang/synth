import traverse from 'babel-traverse'
import generate from 'babel-generator'
import * as babylon from 'babylon'
import * as t from 'babel-types'
import type { BabylonOptions } from 'babylon'
export type { BabylonOptions } from 'babylon'
export { traverse, babylon, t }
import { AsyncSeriesWaterfallHook } from 'tapable'
import type { AST } from '@synth/ast'
export type { AST } from '@synth/ast'

export interface Context {
  ast: t.File
  mdAST: AST[]
  babylon: typeof babylon
  t: typeof t
  code: string
  generate: typeof generate
  traverse: typeof traverse
}

export const traverseHook = new AsyncSeriesWaterfallHook<Context>(['context'])

/**
 * visit code AST
 * @param code js|ts 代码字符串
 * @param options BabylonOptions
 */
export const transformCode = (code: string, options: BabylonOptions): Promise<Context> => {
  return new Promise((resolve, reject) => {
    const ast = babylon.parse(code, options)
    traverseHook.callAsync(
      { ast, babylon, t, code, generate, traverse, mdAST: [] },
      (error, result) => {
        error ? reject(error) : resolve(result as any)
      },
    )
  })
}

export const transformmTDASTHook = new AsyncSeriesWaterfallHook<{ ast: AST[] }>(['context'])

/**
 * 修改 TD AST
 * @param ast @synth/ast : Test Doc AST
 */
export const transformTDAST = (ast: AST[]): Promise<AST[]> => {
  return new Promise((resolve, reject) => {
    transformmTDASTHook.callAsync({ ast }, (error, result) => {
      error ? reject(error) : resolve(result as any)
    })
  })
}
