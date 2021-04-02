import { traverseHook, AST } from '@synth/core'

export default () => {
  traverseHook.tapPromise('transformer-jest', (context) => {
    const tdAST: AST[] = []
    const { traverse, t, ast, generate, code } = context
    return new Promise((resolve) => {
      traverse(ast, {
        enter(path) {
          if (t.isIdentifier(path.node) && t.isCallExpression(path.parent)) {
            if (t.isIdentifier(path.node, { name: 'describe' })) {
              tdAST.push({
                type: 'describe',
                children: [{ type: 'text', value: path.container.arguments[0].value }],
              })
            } else if (t.isIdentifier(path.node, { name: 'test' })) {
              tdAST.push({
                type: 'describe',
                children: [{ type: 'text', value: path.container.arguments[0].value }],
              })
              tdAST.push({
                type: 'code',
                value: path.container.arguments[1].body.body
                  .map((n) => generate(n, {}, code).code)
                  .join('\n'),
              })
            }
          }
        },
      })
      resolve({ ...context, tdAST })
    })
  })
}
