import { transformCode, transformTDAST, loadPlugin, AST } from '../packages/core'
import toMarkdown from 'mdast-util-to-markdown'
import fs from 'fs'

export default (async () => {
  const code = `describe('错误示范', () => {
    test('1. 不要使用 math.add multiple 等方法', () => {
      // 不要使用 math.add
      expect(math.add(0.1, 0.2)).not.toEqual(0.3)
      expect(math.add(0.1, 0.2)).toEqual(0.30000000000000004)
    })
  })`

  loadPlugin()
  const codeResult = await transformCode(code)
  const tdAST: AST[] = codeResult.tdAST
  const tdResult = await transformTDAST(tdAST)
  const mdAST: AST[] = tdResult.mdAST

  fs.writeFileSync('./md.md', toMarkdown({ type: 'root', children: mdAST }))
})()
