import { useState, useEffect } from 'react'
import { History, RotateCcw, Trash2, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { fileHistoryService } from '@/services/fileHistoryService'
import { useEditorStore } from '@/stores/editorStore'
import { DiffMatchPatch } from 'diff-match-patch'
import { cn } from '@/utils/cn'

interface FileHistoryProps {
  fileId: string | null
}

export default function FileHistory({ fileId }: FileHistoryProps) {
  const [versions, setVersions] = useState<any[]>([])
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
  const [diff, setDiff] = useState<string>('')
  const [isDiffOpen, setIsDiffOpen] = useState(false)
  const { editorContent, updateFileContent } = useEditorStore()

  useEffect(() => {
    if (fileId) {
      loadVersions()
    }
  }, [fileId])

  const loadVersions = async () => {
    if (!fileId) return
    const vers = await fileHistoryService.getVersions(fileId)
    setVersions(vers)
  }

  const handleViewDiff = async (version: number) => {
    if (!fileId) return

    const versionData = await fileHistoryService.getVersion(fileId, version)
    const currentContent = editorContent[fileId] || ''

    if (versionData) {
      const dmp = new DiffMatchPatch()
      const diffs = dmp.diff_main(versionData.content, currentContent)
      dmp.diff_cleanupSemantic(diffs)

      const diffHtml = diffs
        .map(([op, text]) => {
          if (op === 1) {
            return `<span class="bg-green-500/20 text-green-600">${escapeHtml(text)}</span>`
          } else if (op === -1) {
            return `<span class="bg-red-500/20 text-red-600">${escapeHtml(text)}</span>`
          }
          return escapeHtml(text)
        })
        .join('')

      setDiff(diffHtml)
      setSelectedVersion(version)
      setIsDiffOpen(true)
    }
  }

  const handleRestore = async (version: number) => {
    if (!fileId) return

    const versionData = await fileHistoryService.getVersion(fileId, version)
    if (versionData) {
      updateFileContent(fileId, versionData.content)
      await fileHistoryService.saveVersion(fileId, versionData.content, '恢复版本')
      loadVersions()
    }
  }

  const handleDelete = async (version: number) => {
    if (!fileId) return
    await fileHistoryService.deleteVersion(fileId, version)
    loadVersions()
  }

  const escapeHtml = (text: string) => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  if (!fileId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        请选择一个文件查看历史版本
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">文件历史版本</h2>
            <p className="text-muted-foreground">查看和恢复文件的历史版本</p>
          </div>
          <Button onClick={loadVersions} variant="outline">
            刷新
          </Button>
        </div>

        {versions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              没有历史版本
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {versions.map((version) => (
              <Card key={version.version}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">版本 {version.version}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(version.timestamp).toLocaleString('zh-CN')}
                      </div>
                      {version.description && (
                        <span className="text-sm text-muted-foreground">
                          {version.description}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDiff(version.version)}
                      >
                        查看差异
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(version.version)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        恢复
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(version.version)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                    {version.content.slice(0, 100)}
                    {version.content.length > 100 && '...'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDiffOpen} onOpenChange={setIsDiffOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>版本差异对比</DialogTitle>
            <DialogDescription>
              版本 {selectedVersion} 与当前版本的差异
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto">
            <pre
              className="p-4 bg-muted rounded font-mono text-sm"
              dangerouslySetInnerHTML={{ __html: diff }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

