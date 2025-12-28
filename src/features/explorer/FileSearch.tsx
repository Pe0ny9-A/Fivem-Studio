import { useState, useEffect, useRef } from 'react'
import { Search, File, Folder, X } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useProjectStore } from '@/stores/projectStore'
import { useEditorStore } from '@/stores/editorStore'
import { FileNode } from '@/types/resource'
import Fuse from 'fuse.js'
import { cn } from '@/utils/cn'

interface FileSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function FileSearch({ open, onOpenChange }: FileSearchProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { fileTree } = useProjectStore()
  const { openFile } = useEditorStore()
  const inputRef = useRef<HTMLInputElement>(null)

  // 扁平化文件树
  const flattenFiles = (nodes: FileNode[], path = ''): Array<FileNode & { fullPath: string }> => {
    const result: Array<FileNode & { fullPath: string }> = []
    
    nodes.forEach(node => {
      const fullPath = path ? `${path}/${node.name}` : node.name
      result.push({ ...node, fullPath })
      
      if (node.children) {
        result.push(...flattenFiles(node.children, fullPath))
      }
    })
    
    return result
  }

  const allFiles = flattenFiles(fileTree)

  const fuse = new Fuse(allFiles, {
    keys: ['name', 'fullPath'],
    threshold: 0.3,
    includeScore: true,
  })

  const results = query
    ? fuse.search(query).map((result: Fuse.FuseResult<FileNode & { fullPath: string }>) => result.item)
    : allFiles.slice(0, 20)

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (results[selectedIndex]) {
          handleSelectFile(results[selectedIndex])
        }
      } else if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, results, selectedIndex, onOpenChange])

  const handleSelectFile = (file: FileNode & { fullPath: string }) => {
    if (file.type === 'file') {
      openFile({
        id: file.id,
        name: file.name,
        path: file.fullPath,
        content: file.content || '',
        language: file.name.endsWith('.lua') ? 'lua' : 
                  file.name.endsWith('.js') ? 'javascript' :
                  file.name.endsWith('.json') ? 'json' : 'plaintext',
        isDirty: false,
      })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="搜索文件... (Ctrl+P)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="max-h-[400px] overflow-auto">
          {results.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              没有找到文件
            </div>
          ) : (
            <div className="py-2">
              {results.map((file: FileNode & { fullPath: string }, index: number) => (
                <button
                  key={file.id}
                  onClick={() => handleSelectFile(file)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-accent transition-colors",
                    index === selectedIndex && "bg-accent"
                  )}
                >
                  {file.type === 'file' ? (
                    <File className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Folder className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{file.name}</div>
                    <div className="text-sm text-muted-foreground truncate">{file.fullPath}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-2 border-t text-xs text-muted-foreground text-center">
          使用 ↑↓ 导航，Enter 选择，Esc 关闭
        </div>
      </DialogContent>
    </Dialog>
  )
}

