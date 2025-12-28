import { useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { useEditorStore } from '@/stores/editorStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { editor } from 'monaco-editor'

interface MonacoEditorProps {
  fileId: string | null
}

export default function MonacoEditor({ fileId }: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const { editorContent, updateFileContent, markAsDirty, openFiles } = useEditorStore()
  const { editorSettings } = useSettingsStore()

  const file = openFiles.find(f => f.id === fileId)
  const content = fileId ? editorContent[fileId] || '' : ''

  useEffect(() => {
    // 配置Monaco Editor的语言支持
    if (window.monaco) {
      // 注册Lua语言（基础配置）
      window.monaco.languages.register({ id: 'lua' })
      window.monaco.languages.setMonarchTokensProvider('lua', {
        tokenizer: {
          root: [
            [/--.*$/, 'comment'],
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
            [/'([^'\\]|\\.)*$/, 'string.invalid'],
            [/'/, { token: 'string.quote', bracket: '@open', next: '@stringsingle' }],
            [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
            [/0[xX][0-9a-fA-F]+/, 'number.hex'],
            [/\d+/, 'number'],
            [/[a-z_$][\w$]*/, {
              cases: {
                '@keywords': 'keyword',
                '@default': 'identifier'
              }
            }],
            [/[<>]=?/, 'operator'],
            [/[=+\-*/%]/, 'operator'],
          ],
          string: [
            [/[^\\"]+/, 'string'],
            [/\\./, 'string.escape.invalid'],
            [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
          ],
          stringsingle: [
            [/[^\\']+/, 'string'],
            [/\\./, 'string.escape.invalid'],
            [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
          ],
        },
        keywords: [
          'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for',
          'function', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat',
          'return', 'then', 'true', 'until', 'while'
        ],
        operators: [
          '+', '-', '*', '/', '%', '^', '#', '==', '~=', '<=', '>=', '<', '>',
          '=', '(', ')', '{', '}', '[', ']', ';', ':', ',', '.', '..', '...'
        ],
      })
    }
  }, [])

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
  }

  const handleChange = (value: string | undefined) => {
    if (fileId && value !== undefined) {
      updateFileContent(fileId, value)
      markAsDirty(fileId)
    }
  }

  const getLanguage = () => {
    if (!file) return 'plaintext'
    return file.language
  }

  if (!fileId || !file) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        请选择一个文件进行编辑
      </div>
    )
  }

  return (
    <div className="h-full">
      <Editor
        height="100%"
        language={getLanguage()}
        value={content}
        theme={editorSettings.theme}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: editorSettings.fontSize,
          tabSize: editorSettings.tabSize,
          wordWrap: editorSettings.wordWrap,
          minimap: {
            enabled: editorSettings.minimap,
          },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  )
}

// 扩展Window接口以支持monaco
declare global {
  interface Window {
    monaco: typeof import('monaco-editor')
  }
}

