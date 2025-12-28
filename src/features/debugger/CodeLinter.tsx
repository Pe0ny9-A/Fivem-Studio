import { useState, useEffect } from 'react'
import { AlertCircle, XCircle, Info, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { lintLuaCode, LintError } from '@/utils/luaLinter'
import { useEditorStore } from '@/stores/editorStore'
import { cn } from '@/utils/cn'

export default function CodeLinter() {
  const [code, setCode] = useState('')
  const [errors, setErrors] = useState<LintError[]>([])
  const { activeFileId, editorContent } = useEditorStore()

  useEffect(() => {
    if (activeFileId && editorContent[activeFileId]) {
      setCode(editorContent[activeFileId])
      handleLint(editorContent[activeFileId])
    }
  }, [activeFileId, editorContent])

  const handleLint = (codeToLint: string) => {
    const lintErrors = lintLuaCode(codeToLint)
    setErrors(lintErrors)
  }

  const handleManualLint = () => {
    handleLint(code)
  }

  const getIcon = (severity: LintError['severity']) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: LintError['severity']) => {
    switch (severity) {
      case 'error':
        return 'border-destructive bg-destructive/10'
      case 'warning':
        return 'border-yellow-500 bg-yellow-500/10'
      case 'info':
        return 'border-blue-500 bg-blue-500/10'
    }
  }

  const errorCount = errors.filter(e => e.severity === 'error').length
  const warningCount = errors.filter(e => e.severity === 'warning').length
  const infoCount = errors.filter(e => e.severity === 'info').length

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">代码检查器</h2>
          <p className="text-muted-foreground">
            静态代码分析，检查语法错误和潜在问题
          </p>
        </div>

        <Tabs defaultValue="editor" className="space-y-4">
          <TabsList>
            <TabsTrigger value="editor">编辑器代码</TabsTrigger>
            <TabsTrigger value="manual">手动输入</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4">
            {activeFileId ? (
              <Card>
                <CardHeader>
                  <CardTitle>当前文件: {activeFileId}</CardTitle>
                  <CardDescription>
                    自动检查当前打开的编辑器文件
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => handleLint(editorContent[activeFileId] || '')}>
                    重新检查
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  请在编辑器中打开一个文件
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>输入代码</CardTitle>
                <CardDescription>粘贴或输入要检查的代码</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="输入Lua代码..."
                  rows={15}
                  className="font-mono text-sm"
                />
                <Button onClick={handleManualLint} className="w-full">
                  检查代码
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {errors.length === 0 ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-green-500">检查通过</CardTitle>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-destructive" />
                    <CardTitle className="text-destructive">发现问题</CardTitle>
                  </>
                )}
              </div>
              <div className="flex gap-4 text-sm">
                {errorCount > 0 && (
                  <span className="text-destructive">错误: {errorCount}</span>
                )}
                {warningCount > 0 && (
                  <span className="text-yellow-500">警告: {warningCount}</span>
                )}
                {infoCount > 0 && (
                  <span className="text-blue-500">信息: {infoCount}</span>
                )}
              </div>
            </div>
            <CardDescription>
              共发现 {errors.length} 个问题
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                没有发现任何问题！
              </div>
            ) : (
              <div className="space-y-3">
                {errors.map((error, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-lg border flex items-start gap-3",
                      getSeverityColor(error.severity)
                    )}
                  >
                    {getIcon(error.severity)}
                    <div className="flex-1">
                      <div className="font-medium mb-1">
                        第 {error.line} 行, 第 {error.column} 列
                      </div>
                      <div className="text-sm mb-2">{error.message}</div>
                      <div className="text-xs text-muted-foreground">
                        规则: {error.rule}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

