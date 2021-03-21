export interface TestDocAST {
  type: 'describe' | 'test'
  children?: Child[]
}

export interface Text {
  type: 'text'
  value: string
}

export interface Code extends Omit<Text, 'type'> {
  type: 'code'
}

export type Child = Text | TestDocAST

export type AST = TestDocAST | Code
