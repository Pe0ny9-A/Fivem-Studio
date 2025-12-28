import { useState, useEffect } from 'react'
import { storageService } from '@/services/storageService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, FileCode } from 'lucide-react'

interface Template {
  id: string
  name: string
  content: string
  type: 'manifest' | 'script' | 'client' | 'server'
  createdAt: number
}

const defaultTemplates: Omit<Template, 'id' | 'createdAt'>[] = [
  {
    name: '基础资源模板',
    content: `fx_version 'cerulean'
game 'gta5'

author 'Your Name'
description 'Resource Description'
version '1.0.0'

client_scripts {
    'client/main.lua'
}

server_scripts {
    'server/main.lua'
}`,
    type: 'manifest',
  },
  {
    name: '客户端脚本模板',
    content: `-- 客户端脚本
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        -- 你的代码
    end
end)`,
    type: 'client',
  },
  {
    name: '服务端脚本模板',
    content: `-- 服务端脚本
RegisterServerEvent('event:name')
AddEventHandler('event:name', function()
    -- 你的代码
end)`,
    type: 'server',
  },
]

export default function ResourceTemplate() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    type: 'script' as const,
  })

  useEffect(() => {
    loadTemplates()
    initializeDefaultTemplates()
  }, [])

  const initializeDefaultTemplates = async () => {
    const existing = await storageService.getAllTemplates()
    if (existing.length === 0) {
      for (const template of defaultTemplates) {
        await storageService.saveTemplate({
          ...template,
          id: `default-${Date.now()}-${Math.random()}`,
        })
      }
      loadTemplates()
    }
  }

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const allTemplates = await storageService.getAllTemplates()
      setTemplates(allTemplates)
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTemplate = async () => {
    if (newTemplate.name.trim() && newTemplate.content.trim()) {
      await storageService.saveTemplate({
        ...newTemplate,
        id: `template-${Date.now()}-${Math.random()}`,
      })
      setNewTemplate({ name: '', content: '', type: 'script' })
      setShowAddDialog(false)
      loadTemplates()
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (confirm('确定要删除这个模板吗？')) {
      await storageService.deleteTemplate(id)
      loadTemplates()
    }
  }

  const handleUseTemplate = (template: Template) => {
    // 这里可以触发一个事件，让编辑器或生成器使用这个模板
    const event = new CustomEvent('useTemplate', { detail: template })
    window.dispatchEvent(event)
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        加载中...
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">资源模板</h1>
            <p className="text-muted-foreground">管理和使用常用脚本模板</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新建模板
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <CardDescription>
                  类型: {template.type === 'manifest' ? '配置文件' : 
                         template.type === 'client' ? '客户端脚本' :
                         template.type === 'server' ? '服务端脚本' : '脚本'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <pre className="p-3 bg-muted rounded text-xs overflow-auto max-h-32 font-mono">
                  {template.content.substring(0, 200)}
                  {template.content.length > 200 && '...'}
                </pre>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleUseTemplate(template)}
                >
                  <FileCode className="h-4 w-4 mr-2" />
                  使用模板
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {showAddDialog && (
          <Card className="fixed inset-4 z-50 max-w-2xl mx-auto bg-background">
            <CardHeader>
              <CardTitle>新建模板</CardTitle>
              <CardDescription>创建一个新的资源模板</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">模板名称</label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="模板名称"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">模板内容</label>
                <Textarea
                  className="h-64 font-mono text-sm"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  placeholder="模板内容..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  取消
                </Button>
                <Button onClick={handleAddTemplate}>保存</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

