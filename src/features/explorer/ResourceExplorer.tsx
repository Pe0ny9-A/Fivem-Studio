import { useState, useRef } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { useEditorStore } from '@/stores/editorStore'
import FileTree from './FileTree'
import { FileNode } from '@/types/resource'
import { EditorFile } from '@/types/editor'
import { 
  createFileNode, 
  updateNodeInTree, 
  removeNodeFromTree, 
  addNodeToTree,
  createFileNodeFromFile,
} from '@/utils/fileUtils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { FilePlus, Upload } from 'lucide-react'

export default function ResourceExplorer() {
  const { fileTree, updateFileTree } = useProjectStore()
  const { openFile } = useEditorStore()
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; fileId: string; currentName: string }>({
    open: false,
    fileId: '',
    currentName: '',
  })
  const [newName, setNewName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: FileNode) => {
    if (file.type === 'file' && file.content !== undefined) {
      const editorFile: EditorFile = {
        id: file.id,
        name: file.name,
        path: file.path,
        content: file.content,
        language: getLanguageFromPath(file.path),
        isDirty: false,
      }
      openFile(editorFile)
    }
  }

  const handleContextMenu = (_file: FileNode, event: React.MouseEvent) => {
    event.preventDefault()
  }

  const handleNewFile = (parentId: string) => {
    const name = prompt('请输入文件名:')
    if (name) {
      const newNode = createFileNode(name, 'file', parentId)
      const updatedTree = addNodeToTree(fileTree, parentId, newNode)
      updateFileTree(updatedTree)
    }
  }

  const handleNewFolder = (parentId: string) => {
    const name = prompt('请输入文件夹名:')
    if (name) {
      const newNode = createFileNode(name, 'folder', parentId)
      const updatedTree = addNodeToTree(fileTree, parentId, newNode)
      updateFileTree(updatedTree)
    }
  }

  const handleRename = (fileId: string) => {
    const node = findNodeInTree(fileTree, fileId)
    if (node) {
      setRenameDialog({
        open: true,
        fileId,
        currentName: node.name,
      })
      setNewName(node.name)
    }
  }

  const handleRenameConfirm = () => {
    if (newName.trim()) {
      const updatedTree = updateNodeInTree(fileTree, renameDialog.fileId, {
        name: newName.trim(),
      })
      updateFileTree(updatedTree)
      setRenameDialog({ open: false, fileId: '', currentName: '' })
      setNewName('')
    }
  }

  const handleDelete = (fileId: string) => {
    if (confirm('确定要删除吗？')) {
      const updatedTree = removeNodeFromTree(fileTree, fileId)
      updateFileTree(updatedTree)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      const fileNode = await createFileNodeFromFile(file)
      const updatedTree = addNodeToTree(fileTree, undefined, fileNode)
      updateFileTree(updatedTree)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    if (!files.length) return

    for (const file of Array.from(files)) {
      const fileNode = await createFileNodeFromFile(file)
      const updatedTree = addNodeToTree(fileTree, undefined, fileNode)
      updateFileTree(updatedTree)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const findNodeInTree = (nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = findNodeInTree(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  const getLanguageFromPath = (path: string): 'lua' | 'javascript' | 'json' | 'plaintext' => {
    const ext = path.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'lua':
        return 'lua'
      case 'js':
      case 'jsx':
        return 'javascript'
      case 'json':
        return 'json'
      default:
        return 'plaintext'
    }
  }

  return (
    <div 
      className="h-full flex flex-col"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="p-2 border-b border-border flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleNewFile('')}
          className="flex-1"
        >
          <FilePlus className="h-4 w-4 mr-2" />
          新建文件
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          上传文件
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
      <div className="flex-1 overflow-auto">
        {fileTree.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <p>暂无文件</p>
            <p className="text-xs mt-2">请上传或创建文件</p>
          </div>
        ) : (
          <FileTree
            nodes={fileTree}
            onFileSelect={handleFileSelect}
            onFileContextMenu={handleContextMenu}
            onNewFile={handleNewFile}
            onNewFolder={handleNewFolder}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        )}
      </div>
      <Dialog open={renameDialog.open} onOpenChange={(open) => 
        setRenameDialog({ ...renameDialog, open })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重命名</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="请输入新名称"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleRenameConfirm()
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => 
              setRenameDialog({ open: false, fileId: '', currentName: '' })
            }>
              取消
            </Button>
            <Button onClick={handleRenameConfirm}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

