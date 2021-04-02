import { transformmTDASTHook, AST, Text, generate } from '@synth/core'

type MDAST = any

const getTextChildrenValue = (ast: AST[] | undefined) => {
  const textNode = ast?.find((a) => a.type === 'text') as Text
  return textNode?.value ?? ''
}

export default () => {
  transformmTDASTHook.tapPromise('transforer-markdown', (context) => {
    const { ast } = context
    const mdAST: MDAST[] = []
    return new Promise((resolve) => {
      const visitAST = (ast: AST[]) => {
        ast.map((a) => {
          if (a.type === 'describe') {
            mdAST.push({
              type: 'heading',
              depth: 1,
              children: [{ type: 'text', vlaue: getTextChildrenValue(a.children) }],
            })
          } else if (a.type === 'test') {
            mdAST.push({
              type: 'heading',
              depth: 2,
              children: [{ type: 'text', value: getTextChildrenValue(a.children) }],
            })
          } else if (a.type === 'code') {
            mdAST.push({
              type: 'code',
              value: a.value,
            })
          }
        })
      }
      resolve({ ast, mdAST })
    })
  })
}
