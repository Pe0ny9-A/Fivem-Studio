import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSettingsStore } from '@/stores/settingsStore'
import { Palette, Monitor, Moon, Sun, Keyboard } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Link } from 'react-router-dom'

const editorThemes = [
  { id: 'vs-dark', name: 'VS Code Dark', preview: 'bg-gray-900' },
  { id: 'vs', name: 'VS Code Light', preview: 'bg-white' },
  { id: 'hc-black', name: 'High Contrast Dark', preview: 'bg-black' },
]

export default function Settings() {
  const { theme, setTheme, editorSettings, updateEditorSettings } = useSettingsStore()
  const [selectedTheme, setSelectedTheme] = useState(editorSettings.theme)

  const handleThemeChange = (newTheme: typeof editorSettings.theme) => {
    setSelectedTheme(newTheme)
    updateEditorSettings({ theme: newTheme })
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">设置</h2>
          <p className="text-muted-foreground">
            自定义应用外观和行为
          </p>
        </div>

        <Tabs defaultValue="appearance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appearance">外观</TabsTrigger>
            <TabsTrigger value="editor">编辑器</TabsTrigger>
            <TabsTrigger value="shortcuts">快捷键</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>应用主题</CardTitle>
                <CardDescription>选择应用的整体主题</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-colors",
                      theme === 'light' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    )}
                  >
                    <Sun className="h-6 w-6" />
                    <span>浅色</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-colors",
                      theme === 'dark' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    )}
                  >
                    <Moon className="h-6 w-6" />
                    <span>深色</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>编辑器主题</CardTitle>
                <CardDescription>选择代码编辑器的主题</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {editorThemes.map((themeOption) => (
                    <button
                      key={themeOption.id}
                      onClick={() => handleThemeChange(themeOption.id as any)}
                      className={cn(
                        "p-4 border-2 rounded-lg transition-colors text-left",
                        selectedTheme === themeOption.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className={cn("w-full h-20 rounded mb-2", themeOption.preview)} />
                      <div className="font-medium">{themeOption.name}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>编辑器设置</CardTitle>
                <CardDescription>自定义编辑器行为</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">字体大小</label>
                  <Input
                    type="number"
                    min="10"
                    max="24"
                    value={editorSettings.fontSize}
                    onChange={(e) => updateEditorSettings({ fontSize: parseInt(e.target.value) || 14 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tab 大小</label>
                  <Input
                    type="number"
                    min="1"
                    max="8"
                    value={editorSettings.tabSize}
                    onChange={(e) => updateEditorSettings({ tabSize: parseInt(e.target.value) || 2 })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">自动换行</label>
                    <p className="text-xs text-muted-foreground">启用时文本会自动换行</p>
                  </div>
                  <Button
                    variant={editorSettings.wordWrap === 'on' ? 'default' : 'outline'}
                    onClick={() => updateEditorSettings({
                      wordWrap: editorSettings.wordWrap === 'on' ? 'off' : 'on'
                    })}
                  >
                    {editorSettings.wordWrap === 'on' ? '开启' : '关闭'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">小地图</label>
                    <p className="text-xs text-muted-foreground">在编辑器右侧显示代码概览</p>
                  </div>
                  <Button
                    variant={editorSettings.minimap ? 'default' : 'outline'}
                    onClick={() => updateEditorSettings({ minimap: !editorSettings.minimap })}
                  >
                    {editorSettings.minimap ? '开启' : '关闭'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shortcuts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>快捷键管理</CardTitle>
                <CardDescription>自定义应用快捷键</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/shortcuts">
                  <Button className="w-full">
                    <Keyboard className="h-4 w-4 mr-2" />
                    打开快捷键设置
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

