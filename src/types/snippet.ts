export interface CodeSnippet {
  id: string
  name: string
  description: string
  prefix: string
  body: string[]
  scope: 'lua' | 'javascript' | 'json' | '*'
  category: string
  tags: string[]
}

export interface SnippetCategory {
  id: string
  name: string
  icon: string
  snippets: CodeSnippet[]
}

