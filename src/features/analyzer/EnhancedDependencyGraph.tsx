import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Upload, AlertCircle, Download } from 'lucide-react'
import { parseManifest, extractDependencies } from '@/utils/manifestParser'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'react-flow-renderer'

interface DependencyNode {
  id: string
  name: string
  dependencies: string[]
}

const nodeTypes = {
  default: ({ data }: any) => (
    <div className="px-4 py-2 bg-card border-2 border-border rounded-lg shadow-lg">
      <div className="font-semibold text-sm">{data.label}</div>
      {data.depsCount > 0 && (
        <div className="text-xs text-muted-foreground mt-1">
          {data.depsCount} 个依赖
        </div>
      )}
    </div>
  ),
}

export default function EnhancedDependencyGraph() {
  const [manifests, setManifests] = useState<Map<string, DependencyNode>>(new Map())
  const [resourceName, setResourceName] = useState('')
  const [manifestContent, setManifestContent] = useState('')
  const [circularDeps, setCircularDeps] = useState<string[][]>([])
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

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

  useEffect(() => {
    detectCircularDependencies()
  }, [detectCircularDependencies])

  // 生成图形节点和边
  useEffect(() => {
    const graphNodes: Node[] = []
    const graphEdges: Edge[] = []
    const nodePositions = new Map<string, { x: number; y: number }>()

    // 计算节点位置（简单的层次布局）
    const levels = new Map<number, string[]>()
    const nodeLevel = new Map<string, number>()

    // 计算每个节点的层级
    const calculateLevels = () => {
      const visited = new Set<string>()
      
      const dfs = (nodeId: string, level: number) => {
        if (visited.has(nodeId)) return
        visited.add(nodeId)
        
        if (!nodeLevel.has(nodeId) || nodeLevel.get(nodeId)! < level) {
          nodeLevel.set(nodeId, level)
        }

        const node = manifests.get(nodeId)
        if (node) {
          node.dependencies.forEach(dep => {
            if (manifests.has(dep)) {
              dfs(dep, level + 1)
            }
          })
        }
      }

      manifests.forEach((_, id) => {
        if (!visited.has(id)) {
          dfs(id, 0)
        }
      })
    }

    calculateLevels()

    // 按层级分组
    nodeLevel.forEach((level, nodeId) => {
      if (!levels.has(level)) {
        levels.set(level, [])
      }
      levels.get(level)!.push(nodeId)
    })

    // 计算位置
    levels.forEach((nodeIds, level) => {
      const xSpacing = 300
      const startX = -(nodeIds.length - 1) * xSpacing / 2
      
      nodeIds.forEach((nodeId, index) => {
        const x = startX + index * xSpacing
        const y = level * 200
        nodePositions.set(nodeId, { x, y })
      })
    })

    // 创建节点
    manifests.forEach((node, id) => {
      const position = nodePositions.get(id) || { x: 0, y: 0 }
      const isCircular = circularDeps.some(cycle => cycle.includes(id))
      
      graphNodes.push({
        id,
        type: 'default',
        position,
        data: {
          label: node.name,
          depsCount: node.dependencies.filter(d => manifests.has(d)).length,
        },
        style: {
          background: isCircular ? '#ef4444' : '#3b82f6',
          color: '#fff',
          border: isCircular ? '2px solid #dc2626' : '2px solid #2563eb',
        },
      })
    })

    // 创建边
    manifests.forEach((node, id) => {
      node.dependencies.forEach(dep => {
        if (manifests.has(dep)) {
          const isCircular = circularDeps.some(cycle => 
            cycle.includes(id) && cycle.includes(dep)
          )
          
          graphEdges.push({
            id: `${id}-${dep}`,
            source: id,
            target: dep,
            type: 'smoothstep',
            animated: isCircular,
            style: {
              stroke: isCircular ? '#ef4444' : '#3b82f6',
              strokeWidth: isCircular ? 3 : 2,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isCircular ? '#ef4444' : '#3b82f6',
            },
          })
        }
      })
    })

    setNodes(graphNodes)
    setEdges(graphEdges)
  }, [manifests, circularDeps, setNodes, setEdges])

  const removeManifest = (id: string) => {
    setManifests(prev => {
      const newMap = new Map(prev)
      newMap.delete(id)
      return newMap
    })
  }

  const exportGraph = () => {
    const data = {
      nodes: Array.from(manifests.values()),
      circularDeps,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dependency-graph.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">增强依赖关系图</h1>
            <p className="text-muted-foreground">交互式可视化资源依赖关系</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportGraph} disabled={manifests.size === 0}>
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
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
                <Button onClick={addManifest} className="flex-1">添加资源</Button>
              </div>

              {manifests.size > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium">已添加的资源:</div>
                  <div className="space-y-1">
                    {Array.from(manifests.values()).map((node) => (
                      <div
                        key={node.id}
                        className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                      >
                        <span>{node.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeManifest(node.id)}
                        >
                          删除
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>依赖关系图</CardTitle>
              <CardDescription>
                拖拽节点移动，使用控制按钮缩放和重置视图
              </CardDescription>
            </CardHeader>
            <CardContent>
              {manifests.size === 0 ? (
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <p>暂无资源</p>
                    <p className="text-sm mt-2">添加资源以查看依赖关系图</p>
                  </div>
                </div>
              ) : (
                <div className="h-96 border rounded-lg">
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    attributionPosition="bottom-left"
                  >
                    <Background />
                    <Controls />
                    <MiniMap />
                  </ReactFlow>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

