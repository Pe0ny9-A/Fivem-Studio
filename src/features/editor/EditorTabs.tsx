import { X } from 'lucide-react'
import { useEditorStore } from '@/stores/editorStore'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

export default function EditorTabs() {
  const { openFiles, activeFileId, setActiveFile, closeFile, unsavedChanges } = useEditorStore()

  if (openFiles.length === 0) {
    return null
  }

  const handleClose = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation()
    closeFile(fileId)
  }

  return (
    <div className="flex items-center border-b border-border bg-muted/30 overflow-x-auto">
      {openFiles.map((file) => {
        const isActive = file.id === activeFileId
        const isDirty = unsavedChanges.has(file.id)

        return (
          <div
            key={file.id}
            onClick={() => setActiveFile(file.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 border-r border-border cursor-pointer transition-colors",
              isActive
                ? "bg-background text-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            <span className="text-sm truncate max-w-[200px]">
              {file.name}
              {isDirty && <span className="ml-1 text-primary">•</span>}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-sm hover:bg-destructive/20 hover:text-destructive"
              onClick={(e) => handleClose(e, file.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}

