import { useState } from 'react'
import { Manifest } from '@/types/manifest'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Copy, Check } from 'lucide-react'
import HelpTooltip from '@/components/HelpTooltip'
import { Link } from 'react-router-dom'

export default function ManifestGenerator() {
  const [manifest, setManifest] = useState<Manifest>({
    fx_version: 'cerulean',
    game: 'common',
    author: '',
    description: '',
    version: '1.0.0',
    shared_scripts: [],
    client_scripts: [],
    server_scripts: [],
    files: [],
    dependencies: [],
  })

  const [copied, setCopied] = useState(false)

  const updateField = (field: keyof Manifest, value: unknown) => {
    setManifest(prev => ({ ...prev, [field]: value }))
  }

  const addArrayItem = (field: 'shared_scripts' | 'client_scripts' | 'server_scripts' | 'files' | 'dependencies', value: string) => {
    if (value.trim()) {
      setManifest(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()],
      }))
    }
  }

  const removeArrayItem = (field: 'shared_scripts' | 'client_scripts' | 'server_scripts' | 'files' | 'dependencies', index: number) => {
    setManifest(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }))
  }

  const generateManifest = (): string => {
    const lines: string[] = []
    lines.push('fx_version \'cerulean\'')
    lines.push('game \'gta5\'')
    lines.push('')
    
    if (manifest.author) {
      lines.push(`author '${manifest.author}'`)
    }
    if (manifest.description) {
      lines.push(`description '${manifest.description}'`)
    }
    if (manifest.version) {
      lines.push(`version '${manifest.version}'`)
    }
    lines.push('')

    if (manifest.shared_scripts && manifest.shared_scripts.length > 0) {
      lines.push('shared_scripts {')
      manifest.shared_scripts.forEach(script => {
        lines.push(`    '${script}',`)
      })
      lines.push('}')
      lines.push('')
    }

    if (manifest.client_scripts && manifest.client_scripts.length > 0) {
      lines.push('client_scripts {')
      manifest.client_scripts.forEach(script => {
        lines.push(`    '${script}',`)
      })
      lines.push('}')
      lines.push('')
    }

    if (manifest.server_scripts && manifest.server_scripts.length > 0) {
      lines.push('server_scripts {')
      manifest.server_scripts.forEach(script => {
        lines.push(`    '${script}',`)
      })
      lines.push('}')
      lines.push('')
    }

    if (manifest.files && manifest.files.length > 0) {
      lines.push('files {')
      manifest.files.forEach(file => {
        lines.push(`    '${file}',`)
      })
      lines.push('}')
      lines.push('')
    }

    if (manifest.dependencies && manifest.dependencies.length > 0) {
      lines.push('dependencies {')
      manifest.dependencies.forEach(dep => {
        lines.push(`    '${dep}',`)
      })
      lines.push('}')
    }

    return lines.join('\n')
  }

  const handleCopy = async () => {
    const manifestText = generateManifest()
    await navigator.clipboard.writeText(manifestText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const manifestText = generateManifest()
    const blob = new Blob([manifestText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fxmanifest.lua'
    a.click()
    URL.revokeObjectURL(url)
  }

  const ArrayInput = ({ 
    field, 
    label, 
    placeholder 
  }: { 
    field: 'shared_scripts' | 'client_scripts' | 'server_scripts' | 'files' | 'dependencies'
    label: string
    placeholder: string
  }) => {
    const [inputValue, setInputValue] = useState('')
    const items = manifest[field] || []

    const helpTexts: Record<string, string> = {
      shared_scripts: '共享脚本在客户端和服务端都会运行，通常用于配置和工具函数',
      client_scripts: '客户端脚本只在玩家游戏中运行，可以访问游戏世界和玩家实体',
      server_scripts: '服务端脚本只在服务器运行，处理数据、数据库操作和权限检查',
      files: '需要加载的静态文件，如HTML、CSS、JavaScript、图片等',
      dependencies: '此资源依赖的其他资源，确保这些资源在此资源之前加载',
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">{label}</label>
          <HelpTooltip content={helpTexts[field] || ''} />
        </div>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addArrayItem(field, inputValue)
                setInputValue('')
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              addArrayItem(field, inputValue)
              setInputValue('')
            }}
          >
            添加
          </Button>
        </div>
        <div className="space-y-1">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
              <span className="flex-1 text-sm">{item}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeArrayItem(field, index)}
              >
                删除
              </Button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">配置生成器</h1>
            <p className="text-muted-foreground">
              生成 fxmanifest.lua 配置文件
              <Link to="/docs" className="ml-2 text-primary hover:underline text-sm">
                查看文档 →
              </Link>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  复制
                </>
              )}
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              下载
            </Button>
          </div>
        </div>

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="scripts">脚本配置</TabsTrigger>
            <TabsTrigger value="other">其他配置</TabsTrigger>
            <TabsTrigger value="preview">预览</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
                <CardDescription>配置资源的基本信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium">作者</label>
                    <HelpTooltip content="资源的作者名称，用于标识资源创建者" />
                  </div>
                  <Input
                    value={manifest.author || ''}
                    onChange={(e) => updateField('author', e.target.value)}
                    placeholder="资源作者"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium">描述</label>
                    <HelpTooltip content="资源的简短描述，说明资源的功能和用途" />
                  </div>
                  <Input
                    value={manifest.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="资源描述"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium">版本</label>
                    <HelpTooltip content="资源的版本号，使用语义化版本格式（如：1.0.0）" />
                  </div>
                  <Input
                    value={manifest.version || ''}
                    onChange={(e) => updateField('version', e.target.value)}
                    placeholder="1.0.0"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scripts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>脚本配置</CardTitle>
                <CardDescription>配置客户端、服务端和共享脚本</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ArrayInput
                  field="shared_scripts"
                  label="共享脚本"
                  placeholder="shared/main.lua"
                />
                <ArrayInput
                  field="client_scripts"
                  label="客户端脚本"
                  placeholder="client/main.lua"
                />
                <ArrayInput
                  field="server_scripts"
                  label="服务端脚本"
                  placeholder="server/main.lua"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="other" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>其他配置</CardTitle>
                <CardDescription>文件、依赖等其他配置</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ArrayInput
                  field="files"
                  label="文件"
                  placeholder="html/index.html"
                />
                <ArrayInput
                  field="dependencies"
                  label="依赖"
                  placeholder="es_extended"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>预览</CardTitle>
                <CardDescription>生成的 fxmanifest.lua 内容</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-muted rounded-md overflow-auto text-sm font-mono">
                  {generateManifest()}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

