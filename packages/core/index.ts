import traverse from '@babel/traverse'
import generate from '@babel/generator'
import { parse, ParserOptions } from '@babel/parser'
import * as t from '@babel/types'
import { AsyncSeriesWaterfallHook } from 'tapable'
import type { AST } from '@synth/ast'
import { composeFunctionPromise } from '@synth/utils'

// export
export * from '@synth/utils'
export type { AST, Text, Code } from '@synth/ast'
export { ParserOptions } from '@babel/parser'
export { traverse, parse, t, generate }

// basic type
export type Options = ParserOptions
export interface BaseContext {
  code: string
  options: Options
  [whatever: string]: any
}

// hooks
export type OnStartHookContext = BaseContext

export interface OnStartHookContextResult extends BaseContext {
  ast: t.File
}

//
export interface TraverseHookContext extends BaseContext {
  ast: t.File
}

export interface TraverseHookContextResult extends BaseContext {
  ast: AST[]
}

//
export interface TransformTDASTHookResult extends BaseContext {
  ast: AST[]
}

export const onStartHook = new AsyncSeriesWaterfallHook<OnStartHookContext>(['context'])
export const traverseHook = new AsyncSeriesWaterfallHook<OnStartHookContextResult>(['context'])
export const transformTDASTHook = new AsyncSeriesWaterfallHook<TraverseHookContextResult>([
  'context',
])
export const onFinishHook = new AsyncSeriesWaterfallHook<TransformTDASTHookResult>(['context'])

// 1. parse ast : string => ast
// 2. traverse
// 3. transformTDAST
// 4. onFinish
export const run = async (code: string, options: Options = {}) => {
  return await composeFunctionPromise([
    () => onStartHook.promise({ code, options }),
    (context: OnStartHookContextResult) => traverseHook.promise(context),
    (context: TraverseHookContextResult) => transformTDASTHook.promise(context),
    (context: TransformTDASTHookResult) => onFinishHook.promise(context),
  ])
}

/**
 * visit code AST
 * @param code js|ts 代码字符串
 * @param options BabylonOptions
 */
export const transformCode = (code: string, options?: ParserOptions): Promise<BaseContext> => {
  return new Promise((resolve, reject) => {
    const ast = parse(code, options)
    traverseHook.callAsync({ ast, code }, (error, result) => {
      error ? reject(error) : resolve(result as any)
    })
  })
}

/**
 * 修改 TD AST
 * @param ast @synth/ast : Test Doc AST
 */
export const transformTDAST = (ast: AST[]): Promise<{ ast: AST[]; [whatever: string]: any }> => {
  return new Promise((resolve, reject) => {
    transformTDASTHook.callAsync({ ast }, (error, result) => {
      error ? reject(error) : resolve(result as any)
    })
  })
}
