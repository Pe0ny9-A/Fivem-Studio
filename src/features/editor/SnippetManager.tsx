import { useState, useEffect } from 'react'
import { Search, Plus, Trash2, Download, Upload } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useSnippetStore } from '@/stores/snippetStore'
import { fivemSnippets, snippetCategories } from '@/data/snippets'
import { CodeSnippet } from '@/types/snippet'
import Fuse from 'fuse.js'
import type { FuseResult } from 'fuse.js'

export default function SnippetManager() {
  const { customSnippets, loadCustomSnippets, addCustomSnippet, deleteCustomSnippet, exportSnippets, importSnippets } = useSnippetStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSnippet, setEditingSnippet] = useState<CodeSnippet | null>(null)

  useEffect(() => {
    loadCustomSnippets()
  }, [loadCustomSnippets])

  const allSnippets = [...fivemSnippets, ...customSnippets]

  const fuse = new Fuse(allSnippets, {
    keys: ['name', 'description', 'prefix', 'tags'],
    threshold: 0.3,
  })

  const filteredSnippets = searchQuery
    ? fuse.search(searchQuery).map((result: FuseResult<CodeSnippet>) => result.item)
    : selectedCategory === 'all'
    ? allSnippets
    : allSnippets.filter((s: CodeSnippet) => s.category === selectedCategory)

  const handleExport = () => {
    const data = exportSnippets()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'snippets.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    try {
      await importSnippets(text)
      alert('代码片段导入成功！')
    } catch (error) {
      alert('导入失败：' + (error as Error).message)
    }
  }

  const handleSaveSnippet = () => {
    if (!editingSnippet) return

    const snippet: CodeSnippet = {
      ...editingSnippet,
      id: editingSnippet.id || `custom-${Date.now()}`,
      category: editingSnippet.category || 'custom',
    }

    addCustomSnippet(snippet)
    setIsDialogOpen(false)
    setEditingSnippet(null)
  }

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">代码片段库</h2>
          <p className="text-muted-foreground">管理和使用代码片段</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <label>
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                导入
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </label>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditingSnippet({
                id: '',
                name: '',
                description: '',
                prefix: '',
                body: [''],
                scope: 'lua',
                category: 'custom',
                tags: [],
              })}>
                <Plus className="h-4 w-4 mr-2" />
                新建片段
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>编辑代码片段</DialogTitle>
                <DialogDescription>创建或编辑代码片段</DialogDescription>
              </DialogHeader>
              {editingSnippet && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">名称</label>
                    <Input
                      value={editingSnippet.name}
                      onChange={(e) => setEditingSnippet({ ...editingSnippet, name: e.target.value })}
                      placeholder="片段名称"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">前缀（触发词）</label>
                    <Input
                      value={editingSnippet.prefix}
                      onChange={(e) => setEditingSnippet({ ...editingSnippet, prefix: e.target.value })}
                      placeholder="输入前缀触发片段"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">描述</label>
                    <Input
                      value={editingSnippet.description}
                      onChange={(e) => setEditingSnippet({ ...editingSnippet, description: e.target.value })}
                      placeholder="片段描述"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">代码内容（每行一行，使用 ${1} 表示占位符）</label>
                    <Textarea
                      value={editingSnippet.body.join('\n')}
                      onChange={(e) => setEditingSnippet({ ...editingSnippet, body: e.target.value.split('\n') })}
                      rows={10}
                      placeholder="代码内容"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleSaveSnippet}>
                      保存
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索代码片段..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
        <TabsList>
          <TabsTrigger value="all">全部</TabsTrigger>
          {snippetCategories.map(cat => (
            <TabsTrigger key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-auto mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSnippets.map((snippet: CodeSnippet) => (
              <Card key={snippet.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{snippet.name}</CardTitle>
                      <CardDescription>{snippet.description}</CardDescription>
                    </div>
                    {snippet.id.startsWith('custom-') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCustomSnippet(snippet.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">前缀: </span>
                      <code className="bg-muted px-2 py-1 rounded">{snippet.prefix}</code>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                        {snippet.body.slice(0, 3).join('\n')}
                        {snippet.body.length > 3 && '...'}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Tabs>
    </div>
  )
}

