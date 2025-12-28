import { useState } from 'react'
import { Download, Upload, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useProjectStore } from '@/stores/projectStore'
import { storageService } from '@/services/storageService'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export default function ProjectExport() {
  const { currentProject, fileTree } = useProjectStore()
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const handleExport = async () => {
    if (!currentProject) {
      alert('没有当前项目')
      return
    }

    setIsExporting(true)
    setExportSuccess(false)

    try {
      const zip = new JSZip()

      // 添加项目信息
      zip.file('project.json', JSON.stringify({
        name: currentProject.name,
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
      }, null, 2))

      // 添加文件
      const addFilesToZip = async (nodes: typeof fileTree, path = '') => {
        for (const node of nodes) {
          const filePath = path ? `${path}/${node.name}` : node.name

          if (node.type === 'file') {
            const content = node.content || ''
            zip.file(filePath, content)
          } else if (node.children) {
            await addFilesToZip(node.children, filePath)
          }
        }
      }

      await addFilesToZip(fileTree)

      // 生成ZIP文件
      const blob = await zip.generateAsync({ type: 'blob' })
      saveAs(blob, `${currentProject.name || 'project'}.zip`)

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error('导出失败:', error)
      alert('导出失败: ' + (error as Error).message)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)

    try {
      const zip = new JSZip()
      const zipData = await zip.loadAsync(file)

      // 读取项目信息
      const projectInfoFile = zipData.file('project.json')
      let projectInfo: any = {}
      if (projectInfoFile) {
        const content = await projectInfoFile.async('string')
        projectInfo = JSON.parse(content)
      }

      // 读取所有文件
      const files: Array<{ path: string; content: string }> = []

      // 等待所有文件读取完成
      await Promise.all(
        Object.keys(zipData.files).map(async (relativePath: string) => {
          const file = zipData.files[relativePath]
          if (!file.dir && relativePath !== 'project.json') {
            const content = await file.async('string')
            files.push({ path: relativePath, content })
          }
        })
      )

      // 构建文件树
      const buildFileTree = (paths: typeof files): any[] => {
        const tree: any = {}

        paths.forEach(({ path, content }) => {
          const parts = path.split('/')
          let current = tree

          parts.forEach((part, index) => {
            if (index === parts.length - 1) {
              // 文件
              current[part] = {
                id: `file-${Date.now()}-${Math.random()}`,
                name: part,
                type: 'file',
                path,
                content,
              }
            } else {
              // 文件夹
              if (!current[part]) {
                current[part] = {
                  id: `folder-${Date.now()}-${Math.random()}`,
                  name: part,
                  type: 'folder',
                  path: parts.slice(0, index + 1).join('/'),
                  children: {},
                }
              }
              current = current[part].children
            }
          })
        })

        const convertToArray = (obj: any): any[] => {
          return Object.values(obj).map((item: any) => ({
            ...item,
            children: item.children ? convertToArray(item.children) : undefined,
          }))
        }

        return convertToArray(tree)
      }

      const fileTree = buildFileTree(files)

      // 创建项目
      const project = {
        id: `imported-${Date.now()}`,
        name: projectInfo.name || '导入的项目',
        resources: [{
          id: `resource-${Date.now()}`,
          name: projectInfo.name || '导入的资源',
          path: '',
          files: fileTree,
        }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      await storageService.saveProject(project)
      useProjectStore.getState().setCurrentProject(project)

      alert('项目导入成功！')
    } catch (error) {
      console.error('导入失败:', error)
      alert('导入失败: ' + (error as Error).message)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">项目导出/导入</h2>
          <p className="text-muted-foreground">
            导出项目为ZIP文件，或从ZIP文件导入项目
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                <CardTitle>导出项目</CardTitle>
              </div>
              <CardDescription>
                将当前项目导出为ZIP文件
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                导出包含所有文件和项目结构
              </div>
              <Button
                onClick={handleExport}
                disabled={!currentProject || isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <>导出中...</>
                ) : exportSuccess ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    导出成功
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    导出项目
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                <CardTitle>导入项目</CardTitle>
              </div>
              <CardDescription>
                从ZIP文件导入项目
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                选择之前导出的ZIP文件
              </div>
              <label>
                <Button
                  asChild
                  variant="outline"
                  disabled={isImporting}
                  className="w-full"
                >
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {isImporting ? '导入中...' : '选择ZIP文件'}
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={handleImport}
                />
              </label>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>导出项目：</strong>
              <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
                <li>导出为ZIP格式，包含所有文件</li>
                <li>保留项目结构和文件内容</li>
                <li>可以在其他设备上导入使用</li>
              </ul>
            </div>
            <div>
              <strong>导入项目：</strong>
              <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
                <li>从ZIP文件恢复项目</li>
                <li>自动重建文件树结构</li>
                <li>导入后会替换当前项目</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

