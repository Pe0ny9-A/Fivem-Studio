import { useState } from 'react'
import { File, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react'
import { FileNode } from '@/types/resource'
import { cn } from '@/utils/cn'
import FileContextMenu from './FileContextMenu'

interface FileTreeProps {
  nodes: FileNode[]
  onFileSelect?: (file: FileNode) => void
  onFileContextMenu?: (file: FileNode, event: React.MouseEvent) => void
  onNewFile?: (parentId: string) => void
  onNewFolder?: (parentId: string) => void
  onRename?: (fileId: string) => void
  onDelete?: (fileId: string) => void
  level?: number
}

export default function FileTree({ 
  nodes, 
  onFileSelect, 
  onFileContextMenu,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
  level = 0 
}: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const handleClick = (node: FileNode) => {
    if (node.type === 'folder') {
      toggleFolder(node.id)
    } else {
      onFileSelect?.(node)
    }
  }

  const handleContextMenu = (node: FileNode, event: React.MouseEvent) => {
    event.preventDefault()
    onFileContextMenu?.(node, event)
  }

  return (
    <div className="select-none">
      {nodes.map((node) => {
        const isExpanded = expandedFolders.has(node.id)
        const hasChildren = node.children && node.children.length > 0
        const isFolder = node.type === 'folder'

        const treeItem = (
          <div key={node.id}>
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-accent rounded-sm",
                level > 0 && "ml-4"
              )}
              style={{ paddingLeft: `${level * 16 + 8}px` }}
              onClick={() => handleClick(node)}
              onContextMenu={(e) => handleContextMenu(node, e)}
            >
              {isFolder ? (
                <>
                  {hasChildren ? (
                    isExpanded ? (
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    )
                  ) : (
                    <div className="w-3" />
                  )}
                  {isExpanded ? (
                    <FolderOpen className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Folder className="h-4 w-4 text-blue-500" />
                  )}
                </>
              ) : (
                <>
                  <div className="w-3" />
                  <File className="h-4 w-4 text-muted-foreground" />
                </>
              )}
              <span className="text-sm truncate flex-1">{node.name}</span>
            </div>
            {isFolder && isExpanded && hasChildren && (
              <FileTree
                nodes={node.children!}
                onFileSelect={onFileSelect}
                onFileContextMenu={onFileContextMenu}
                onNewFile={onNewFile}
                onNewFolder={onNewFolder}
                onRename={onRename}
                onDelete={onDelete}
                level={level + 1}
              />
            )}
          </div>
        )

        return onNewFile || onNewFolder || onRename || onDelete ? (
          <FileContextMenu
            key={node.id}
            node={node}
            onNewFile={() => onNewFile?.(node.id)}
            onNewFolder={() => onNewFolder?.(node.id)}
            onRename={() => onRename?.(node.id)}
            onDelete={() => onDelete?.(node.id)}
          >
            {treeItem}
          </FileContextMenu>
        ) : (
          treeItem
        )
      })}
    </div>
  )
}

