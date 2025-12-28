import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Code, Folder, BarChart3, Clock, TrendingUp } from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import { useEditorStore } from '@/stores/editorStore'
import { storageService } from '@/services/storageService'

export default function ProjectStats() {
  const { fileTree, currentProject } = useProjectStore()
  const { openFiles, editorContent } = useEditorStore()
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalLines: 0,
    totalSize: 0,
    fileTypes: {} as Record<string, number>,
    languages: {} as Record<string, number>,
  })

  useEffect(() => {
    calculateStats()
  }, [fileTree, editorContent])

  const calculateStats = () => {
    let totalLines = 0
    let totalSize = 0
    const fileTypes: Record<string, number> = {}
    const languages: Record<string, number> = {}

    const countFiles = (nodes: typeof fileTree) => {
      nodes.forEach(node => {
        if (node.type === 'file') {
          const ext = node.name.split('.').pop() || 'no-ext'
          fileTypes[ext] = (fileTypes[ext] || 0) + 1

          const content = node.content || editorContent[node.id] || ''
          const lines = content.split('\n').length
          totalLines += lines
          totalSize += new Blob([content]).size

          if (node.name.endsWith('.lua')) {
            languages['lua'] = (languages['lua'] || 0) + 1
          } else if (node.name.endsWith('.js')) {
            languages['javascript'] = (languages['javascript'] || 0) + 1
          } else if (node.name.endsWith('.json')) {
            languages['json'] = (languages['json'] || 0) + 1
          }
        }
        if (node.children) {
          countFiles(node.children)
        }
      })
    }

    countFiles(fileTree)

    setStats({
      totalFiles: fileTree.filter(n => n.type === 'file').length,
      totalLines,
      totalSize,
      fileTypes,
      languages,
    })
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">项目统计</h2>
          <p className="text-muted-foreground">
            查看项目的代码统计信息
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">文件总数</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFiles}</div>
              <p className="text-xs text-muted-foreground">
                当前项目文件数
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">代码行数</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLines.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                总代码行数
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">项目大小</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatSize(stats.totalSize)}</div>
              <p className="text-xs text-muted-foreground">
                文件总大小
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">打开文件</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openFiles.length}</div>
              <p className="text-xs text-muted-foreground">
                当前打开的文件
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>文件类型分布</CardTitle>
              <CardDescription>按文件扩展名统计</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(stats.fileTypes).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无数据
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(stats.fileTypes)
                    .sort(([, a], [, b]) => b - a)
                    .map(([ext, count]) => (
                      <div key={ext} className="flex items-center justify-between">
                        <span className="text-sm font-medium">.{ext}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${(count / stats.totalFiles) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>编程语言分布</CardTitle>
              <CardDescription>按编程语言统计</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(stats.languages).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无数据
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(stats.languages)
                    .sort(([, a], [, b]) => b - a)
                    .map(([lang, count]) => (
                      <div key={lang} className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{lang}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${(count / Object.values(stats.languages).reduce((a, b) => a + b, 0)) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

