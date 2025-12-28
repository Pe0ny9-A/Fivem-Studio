import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'
import { FilePlus, FolderPlus, Trash2, Edit } from 'lucide-react'
import { FileNode } from '@/types/resource'
import { cn } from '@/utils/cn'

interface FileContextMenuProps {
  node: FileNode
  children: React.ReactNode
  onNewFile?: () => void
  onNewFolder?: () => void
  onRename?: () => void
  onDelete?: () => void
}

export default function FileContextMenu({
  node,
  children,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
}: FileContextMenuProps) {
  return (
    <ContextMenuPrimitive.Root>
      <ContextMenuPrimitive.Trigger asChild>
        {children}
      </ContextMenuPrimitive.Trigger>
      <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.Content
          className={cn(
            "min-w-[220px] bg-popover text-popover-foreground rounded-md overflow-hidden p-1 shadow-md z-50",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        >
          {node.type === 'folder' && (
            <>
              <ContextMenuPrimitive.Item
                className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm"
                onSelect={onNewFile}
              >
                <FilePlus className="h-4 w-4" />
                新建文件
              </ContextMenuPrimitive.Item>
              <ContextMenuPrimitive.Item
                className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm"
                onSelect={onNewFolder}
              >
                <FolderPlus className="h-4 w-4" />
                新建文件夹
              </ContextMenuPrimitive.Item>
              <ContextMenuPrimitive.Separator className="h-px bg-border my-1" />
            </>
          )}
          <ContextMenuPrimitive.Item
            className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm"
            onSelect={onRename}
          >
            <Edit className="h-4 w-4" />
            重命名
          </ContextMenuPrimitive.Item>
          <ContextMenuPrimitive.Item
            className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-destructive hover:text-destructive-foreground rounded-sm text-destructive"
            onSelect={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            删除
          </ContextMenuPrimitive.Item>
        </ContextMenuPrimitive.Content>
      </ContextMenuPrimitive.Portal>
    </ContextMenuPrimitive.Root>
  )
}

