import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RotateCcw, Keyboard } from 'lucide-react'
import { useShortcutStore, Shortcut } from '@/stores/shortcutStore'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function Shortcuts() {
  const { shortcuts, loadShortcuts, updateShortcut, resetShortcut, resetAllShortcuts } = useShortcutStore()
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [keyInput, setKeyInput] = useState('')

  useEffect(() => {
    loadShortcuts()
  }, [loadShortcuts])

  const formatShortcut = (shortcut: Shortcut) => {
    const parts: string[] = []
    if (shortcut.ctrl) parts.push('Ctrl')
    if (shortcut.shift) parts.push('Shift')
    if (shortcut.alt) parts.push('Alt')
    if (shortcut.meta) parts.push('Meta')
    parts.push(shortcut.customKey || shortcut.defaultKey.toUpperCase())
    return parts.join(' + ')
  }

  const handleEdit = (shortcut: Shortcut) => {
    setEditingShortcut(shortcut)
    setKeyInput('')
    setIsDialogOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault()
    const key = e.key.toLowerCase()
    
    if (key === 'control' || key === 'shift' || key === 'alt' || key === 'meta') {
      return
    }

    if (editingShortcut) {
      setKeyInput(key)
      updateShortcut(editingShortcut.id, {
        customKey: key,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
        meta: e.metaKey,
      })
      setIsDialogOpen(false)
      setEditingShortcut(null)
    }
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">快捷键设置</h2>
            <p className="text-muted-foreground">
              管理和自定义快捷键
            </p>
          </div>
          <Button variant="outline" onClick={resetAllShortcuts}>
            <RotateCcw className="h-4 w-4 mr-2" />
            重置全部
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>快捷键列表</CardTitle>
            <CardDescription>
              点击快捷键进行编辑，按新的组合键保存
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{shortcut.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {shortcut.description}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Keyboard className="h-4 w-4 text-muted-foreground" />
                      <kbd className="px-3 py-1 bg-muted rounded text-sm font-mono">
                        {formatShortcut(shortcut)}
                      </kbd>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(shortcut)}
                      >
                        编辑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resetShortcut(shortcut.id)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>编辑快捷键：</strong>
              <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
                <li>点击"编辑"按钮</li>
                <li>按下你想要的新快捷键组合</li>
                <li>系统会自动保存</li>
              </ul>
            </div>
            <div>
              <strong>重置快捷键：</strong>
              <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
                <li>点击单个快捷键的重置按钮恢复默认值</li>
                <li>或点击"重置全部"恢复所有快捷键</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑快捷键</DialogTitle>
              <DialogDescription>
                按下你想要的新快捷键组合
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">
                  当前快捷键: {editingShortcut && formatShortcut(editingShortcut)}
                </div>
                <Input
                  placeholder="按下新的快捷键..."
                  value={keyInput}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  readOnly
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

