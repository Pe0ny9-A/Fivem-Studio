import { CodeSnippet } from '@/types/snippet'
import { fivemSnippets } from '@/data/snippets'

export function registerSnippets(monaco: typeof import('monaco-editor'), customSnippets: CodeSnippet[] = []) {
  const allSnippets = [...fivemSnippets, ...customSnippets]

  // 按语言分组
  const snippetsByLanguage: Record<string, any[]> = {
    lua: [],
    javascript: [],
    json: [],
  }

  allSnippets.forEach(snippet => {
    const language = snippet.scope === '*' ? ['lua', 'javascript'] : [snippet.scope]
    
    language.forEach(lang => {
      if (!snippetsByLanguage[lang]) {
        snippetsByLanguage[lang] = []
      }

      // 转换片段格式为Monaco格式
      const monacoSnippet = {
        label: snippet.name,
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: snippet.description,
        insertText: snippet.body.join('\n'),
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: snippet.description,
        filterText: snippet.prefix,
        sortText: snippet.prefix,
      }

      snippetsByLanguage[lang].push(monacoSnippet)
    })
  })

  // 为每种语言注册片段
  Object.keys(snippetsByLanguage).forEach(language => {
    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: () => {
        return {
          suggestions: snippetsByLanguage[language],
        }
      },
      triggerCharacters: [],
    })
  })
}

