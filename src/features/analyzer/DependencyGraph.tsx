import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Upload, AlertCircle } from 'lucide-react'
import { parseManifest, extractDependencies } from '@/utils/manifestParser'

interface DependencyNode {
  id: string
  name: string
  dependencies: string[]
}

export default function DependencyGraph() {
  const [manifests, setManifests] = useState<Map<string, DependencyNode>>(new Map())
  const [resourceName, setResourceName] = useState('')
  const [manifestContent, setManifestContent] = useState('')
  const [circularDeps, setCircularDeps] = useState<string[][]>([])

  const addManifest = () => {
    if (!resourceName.trim() || !manifestContent.trim()) return

    const parsed = parseManifest(manifestContent)
    if (parsed) {
      const dependencies = extractDependencies(parsed)
      const node: DependencyNode = {
        id: resourceName.trim(),
        name: resourceName.trim(),
        dependencies,
      }
      setManifests(prev => new Map(prev).set(node.id, node))
      setResourceName('')
      setManifestContent('')
      detectCircularDependencies()
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const name = file.name.replace('.lua', '').replace('fxmanifest', '')
        setResourceName(name || 'resource')
        setManifestContent(content)
      }
      reader.readAsText(file)
    }
  }

  const detectCircularDependencies = useCallback(() => {
    if (manifests.size === 0) {
      setCircularDeps([])
      return
    }

    const circular: string[][] = []
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const dfs = (nodeId: string, path: string[]): void => {
      if (recursionStack.has(nodeId)) {
        // 找到循环依赖
        const cycleStart = path.indexOf(nodeId)
        const cycle = path.slice(cycleStart).concat(nodeId)
        circular.push(cycle)
        return
      }

      if (visited.has(nodeId)) {
        return
      }

      visited.add(nodeId)
      recursionStack.add(nodeId)

      const node = manifests.get(nodeId)
      if (node) {
        for (const dep of node.dependencies) {
          if (manifests.has(dep)) {
            dfs(dep, [...path, nodeId])
          }
        }
      }

      recursionStack.delete(nodeId)
    }

    for (const [id] of manifests) {
      if (!visited.has(id)) {
        dfs(id, [])
      }
    }

    setCircularDeps(circular)
  }, [manifests])

  // 当manifests变化时检测循环依赖
  useEffect(() => {
    detectCircularDependencies()
  }, [detectCircularDependencies])

  const removeManifest = (id: string) => {
    setManifests(prev => {
      const newMap = new Map(prev)
      newMap.delete(id)
      return newMap
    })
    setTimeout(detectCircularDependencies, 0)
  }

  const renderGraph = () => {
    const nodes = Array.from(manifests.values())
    if (nodes.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-12">
          <p>暂无资源</p>
          <p className="text-sm mt-2">添加快捷方式以查看依赖关系</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {nodes.map((node) => (
          <Card key={node.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{node.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeManifest(node.id)}
                >
                  删除
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {node.dependencies.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium">依赖:</div>
                  <div className="flex flex-wrap gap-2">
                    {node.dependencies.map((dep, index) => {
                      const exists = manifests.has(dep)
                      return (
                        <div
                          key={index}
                          className={`px-3 py-1 rounded text-sm ${
                            exists
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {dep}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">无依赖</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">依赖关系图</h1>
          <p className="text-muted-foreground">分析和可视化资源依赖关系</p>
        </div>

        {circularDeps.length > 0 && (
          <Card className="border-destructive">
            <CardHeader>
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <CardTitle>检测到循环依赖</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {circularDeps.map((cycle, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">循环 {index + 1}:</span>{' '}
                    {cycle.join(' → ')}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>添加资源</CardTitle>
            <CardDescription>上传或输入 fxmanifest.lua 内容</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">资源名称</label>
              <Input
                value={resourceName}
                onChange={(e) => setResourceName(e.target.value)}
                placeholder="资源名称"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">配置文件内容</label>
              <Textarea
                className="h-48 font-mono text-sm"
                value={manifestContent}
                onChange={(e) => setManifestContent(e.target.value)}
                placeholder="fxmanifest.lua 内容..."
              />
            </div>
            <div className="flex gap-2">
              <label>
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    上传文件
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".lua"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
              <Button onClick={addManifest}>添加资源</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>依赖关系</CardTitle>
            <CardDescription>资源依赖关系可视化</CardDescription>
          </CardHeader>
          <CardContent>{renderGraph()}</CardContent>
        </Card>
      </div>
    </div>
  )
}

