import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, FileCode, Folder, Loader2 } from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import { FileNode } from '@/types/resource'

interface GitHubFile {
  name: string
  path: string
  type: 'file' | 'dir'
  download_url: string | null
  size: number
}

export default function GitHubImporter() {
  const [repoUrl, setRepoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<GitHubFile[]>([])
  const { setCurrentProject } = useProjectStore()

  const parseGitHubUrl = (url: string): { owner: string; repo: string; path?: string } | null => {
    // 支持多种GitHub URL格式
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/[^\/]+\/(.+))?/,
      /github\.com\/([^\/]+)\/([^\/]+)$/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return {
          owner: match[1],
          repo: match[2],
          path: match[3] || undefined,
        }
      }
    }

    return null
  }

  const fetchGitHubFiles = async (owner: string, repo: string, path = '') => {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
    
    try {
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error(`GitHub API错误: ${response.status}`)
      }

      const data = await response.json()
      
      if (Array.isArray(data)) {
        return data as GitHubFile[]
      } else {
        return [data as GitHubFile]
      }
    } catch (error) {
      throw new Error(`无法获取文件: ${(error as Error).message}`)
    }
  }

  const fetchFileContent = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('无法下载文件')
      }
      return await response.text()
    } catch (error) {
      throw new Error(`下载文件失败: ${(error as Error).message}`)
    }
  }

  const buildFileTree = async (files: GitHubFile[]): Promise<FileNode[]> => {
    const tree: Map<string, FileNode> = new Map()

    // 先创建所有节点
    files.forEach(file => {
      const parts = file.path.split('/')
      const fileName = parts[parts.length - 1]

      if (file.type === 'file') {
        const nodeId = `file-${file.path}`
        tree.set(file.path, {
          id: nodeId,
          name: fileName,
          type: 'file',
          path: file.path,
          content: '', // 稍后填充
        })
      } else {
        const nodeId = `folder-${file.path}`
        tree.set(file.path, {
          id: nodeId,
          name: fileName,
          type: 'folder',
          path: file.path,
          children: [],
        })
      }
    })

    // 构建层级关系
    const rootNodes: FileNode[] = []
    const processed = new Set<string>()

    files.forEach(file => {
      if (processed.has(file.path)) return

      const parts = file.path.split('/')
      let currentPath = ''
      let parentNode: FileNode | null = null

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        currentPath = currentPath ? `${currentPath}/${part}` : part

        if (!tree.has(currentPath)) {
          // 创建缺失的文件夹
          const nodeId = `folder-${currentPath}`
          const folderNode: FileNode = {
            id: nodeId,
            name: part,
            type: 'folder',
            path: currentPath,
            children: [],
          }
          tree.set(currentPath, folderNode)
        }

        const currentNode = tree.get(currentPath)!
        
        if (i === 0 && !parentNode) {
          // 根节点
          if (!rootNodes.find(n => n.id === currentNode.id)) {
            rootNodes.push(currentNode)
          }
        } else if (parentNode && parentNode.type === 'folder') {
          // 添加到父节点
          if (!parentNode.children) {
            parentNode.children = []
          }
          if (!parentNode.children.find(n => n.id === currentNode.id)) {
            parentNode.children.push(currentNode)
          }
        }

        parentNode = currentNode
        processed.add(currentPath)
      }
    })

    return rootNodes
  }

  const handleImport = async () => {
    if (!repoUrl.trim()) {
      setError('请输入GitHub仓库URL')
      return
    }

    setIsLoading(true)
    setError(null)
    setFiles([])

    try {
      const parsed = parseGitHubUrl(repoUrl)
      if (!parsed) {
        throw new Error('无效的GitHub URL格式')
      }

      // 获取文件列表
      const repoFiles = await fetchGitHubFiles(parsed.owner, parsed.repo, parsed.path)
      setFiles(repoFiles)

      // 下载文件内容（仅限小文件，< 1MB）
      const fileNodes: FileNode[] = []
      for (const file of repoFiles) {
        if (file.type === 'file' && file.download_url && file.size < 1024 * 1024) {
          try {
            const content = await fetchFileContent(file.download_url)
            fileNodes.push({
              id: `file-${file.path}`,
              name: file.name,
              type: 'file',
              path: file.path,
              content,
            })
          } catch (e) {
            console.warn(`无法下载文件 ${file.path}:`, e)
          }
        }
      }

      // 构建文件树
      const fileTree = await buildFileTree(repoFiles)
      
      // 填充文件内容
      const fillContent = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.type === 'file') {
            const fileNode = fileNodes.find(f => f.path === node.path)
            return fileNode || node
          } else if (node.children) {
            return {
              ...node,
              children: fillContent(node.children),
            }
          }
          return node
        })
      }

      const finalTree = fillContent(fileTree)

      // 创建项目
      const project = {
        id: `github-${parsed.owner}-${parsed.repo}-${Date.now()}`,
        name: `${parsed.owner}/${parsed.repo}`,
        resources: [{
          id: `resource-${Date.now()}`,
          name: parsed.repo,
          path: '',
          files: finalTree,
        }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      setCurrentProject(project)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">GitHub 导入</h2>
          <p className="text-muted-foreground">
            从公开的 GitHub 仓库导入项目（只读模式）
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>导入仓库</CardTitle>
            <CardDescription>
              输入 GitHub 仓库 URL，支持公开仓库
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repo 或 https://github.com/owner/repo/tree/branch/path"
                className="flex-1"
              />
              <Button onClick={handleImport} disabled={isLoading || !repoUrl.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    导入中...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    导入
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            {files.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">
                  找到 {files.length} 个文件/文件夹
                </div>
                <div className="max-h-64 overflow-auto space-y-1">
                  {files.slice(0, 50).map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-muted rounded text-sm"
                    >
                      {file.type === 'file' ? (
                        <FileCode className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Folder className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-mono">{file.path}</span>
                      {file.type === 'file' && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          {(file.size / 1024).toFixed(2)} KB
                        </span>
                      )}
                    </div>
                  ))}
                  {files.length > 50 && (
                    <div className="text-xs text-muted-foreground text-center py-2">
                      还有 {files.length - 50} 个项目...
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>支持的URL格式：</strong>
              <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
                <li>https://github.com/owner/repo</li>
                <li>https://github.com/owner/repo/tree/branch</li>
                <li>https://github.com/owner/repo/tree/branch/path</li>
              </ul>
            </div>
            <div>
              <strong>限制：</strong>
              <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
                <li>仅支持公开仓库</li>
                <li>仅下载小于 1MB 的文件</li>
                <li>导入的项目为只读模式</li>
                <li>需要网络连接</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

