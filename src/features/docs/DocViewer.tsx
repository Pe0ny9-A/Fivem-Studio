import { useState } from 'react'
import { fivemDocs, searchDocs, type DocSection } from '@/data/fivemDocs'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, BookOpen, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function DocViewer() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<DocSection | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<DocSection[]>([])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = searchDocs(query)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    const category = fivemDocs.find(cat => cat.id === categoryId)
    if (category && category.sections.length > 0) {
      setSelectedSection(category.sections[0])
    }
  }

  const handleSectionSelect = (section: DocSection) => {
    setSelectedSection(section)
  }

  const renderMarkdown = (content: string) => {
    // 简单的Markdown渲染（不依赖外部库）
    const lines = content.split('\n')
    const elements: JSX.Element[] = []
    let inCodeBlock = false
    let codeBlockLang = ''
    let codeBlockContent: string[] = []
    let currentParagraph: string[] = []

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const text = currentParagraph.join(' ')
        elements.push(
          <p key={`p-${elements.length}`} className="mb-4">
            {text.split(/(`[^`]+`)/g).map((part, i) => {
              if (part.startsWith('`') && part.endsWith('`')) {
                return (
                  <code key={i} className="bg-muted px-1.5 py-0.5 rounded text-sm">
                    {part.slice(1, -1)}
                  </code>
                )
              }
              return part
            })}
          </p>
        )
        currentParagraph = []
      }
    }

    const flushCodeBlock = () => {
      if (codeBlockContent.length > 0) {
        elements.push(
          <pre key={`code-${elements.length}`} className="bg-muted p-4 rounded-md overflow-x-auto mb-4">
            <code className={`language-${codeBlockLang} text-sm font-mono`}>
              {codeBlockContent.join('\n')}
            </code>
          </pre>
        )
        codeBlockContent = []
        codeBlockLang = ''
      }
    }

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock()
          inCodeBlock = false
        } else {
          flushParagraph()
          inCodeBlock = true
          codeBlockLang = line.slice(3).trim()
        }
        return
      }

      if (inCodeBlock) {
        codeBlockContent.push(line)
        return
      }

      if (line.startsWith('# ')) {
        flushParagraph()
        elements.push(
          <h1 key={`h1-${index}`} className="text-3xl font-bold mb-4 mt-6">
            {line.slice(2)}
          </h1>
        )
        return
      }

      if (line.startsWith('## ')) {
        flushParagraph()
        elements.push(
          <h2 key={`h2-${index}`} className="text-2xl font-bold mb-3 mt-5">
            {line.slice(3)}
          </h2>
        )
        return
      }

      if (line.startsWith('### ')) {
        flushParagraph()
        elements.push(
          <h3 key={`h3-${index}`} className="text-xl font-semibold mb-2 mt-4">
            {line.slice(4)}
          </h3>
        )
        return
      }

      if (line.trim() === '') {
        flushParagraph()
        return
      }

      currentParagraph.push(line)
    })

    flushParagraph()
    flushCodeBlock()

    return <div className="prose prose-sm dark:prose-invert max-w-none">{elements}</div>
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* 侧边栏 */}
      <div className="w-80 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="搜索文档..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {searchQuery ? (
            <div className="p-4 space-y-2">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                搜索结果 ({searchResults.length})
              </div>
              {searchResults.length > 0 ? (
                searchResults.map((section) => (
                  <div
                    key={section.id}
                    onClick={() => {
                      setSelectedSection(section)
                      setSelectedCategory(section.category)
                    }}
                    className={cn(
                      "p-3 rounded-md cursor-pointer hover:bg-accent transition-colors",
                      selectedSection?.id === section.id && "bg-accent"
                    )}
                  >
                    <div className="font-medium text-sm">{section.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {fivemDocs.find(cat => cat.id === section.category)?.name}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  未找到相关文档
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {fivemDocs.map((category) => (
                <div key={category.id}>
                  <div
                    onClick={() => handleCategorySelect(category.id)}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors mb-2",
                      selectedCategory === category.id && "bg-accent"
                    )}
                  >
                    <span>{category.icon}</span>
                    <span className="font-medium text-sm">{category.name}</span>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 ml-auto transition-transform",
                        selectedCategory === category.id && "rotate-90"
                      )}
                    />
                  </div>
                  {selectedCategory === category.id && (
                    <div className="ml-6 space-y-1">
                      {category.sections.map((section) => (
                        <div
                          key={section.id}
                          onClick={() => handleSectionSelect(section)}
                          className={cn(
                            "p-2 rounded-md cursor-pointer hover:bg-accent transition-colors text-sm",
                            selectedSection?.id === section.id && "bg-accent font-medium"
                          )}
                        >
                          {section.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-auto p-6">
        {selectedSection ? (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span>
                  {fivemDocs.find(cat => cat.id === selectedSection.category)?.icon}
                </span>
                <span>
                  {fivemDocs.find(cat => cat.id === selectedSection.category)?.name}
                </span>
              </div>
              <h1 className="text-3xl font-bold">{selectedSection.title}</h1>
            </div>
            <Card>
              <CardContent className="p-6">
                {renderMarkdown(selectedSection.content)}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h2 className="text-2xl font-bold mb-2">FiveM 文档</h2>
                <p className="text-muted-foreground">
                  从左侧选择文档类别开始浏览，或使用搜索功能查找特定内容
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

