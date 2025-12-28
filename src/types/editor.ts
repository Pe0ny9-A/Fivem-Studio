export interface EditorFile {
  id: string
  name: string
  path: string
  content: string
  language: 'lua' | 'javascript' | 'json' | 'plaintext'
  isDirty: boolean
}

export interface EditorConfig {
  fontSize: number
  tabSize: number
  wordWrap: 'on' | 'off'
  minimap: boolean
  theme: 'vs-dark' | 'vs' | 'hc-black'
}

