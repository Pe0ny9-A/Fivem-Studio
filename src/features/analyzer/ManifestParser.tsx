import { useState } from 'react'
import { parseManifest, extractDependencies, extractScripts } from '@/utils/manifestParser'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Upload, FileText } from 'lucide-react'
import { ParsedManifest } from '@/utils/manifestParser'

export default function ManifestParser() {
  const [manifestContent, setManifestContent] = useState('')
  const [parsedManifest, setParsedManifest] = useState<ParsedManifest | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleParse = () => {
    setError(null)
    const parsed = parseManifest(manifestContent)
    if (parsed) {
      setParsedManifest(parsed)
    } else {
      setError('解析失败，请检查文件格式')
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setManifestContent(content)
        const parsed = parseManifest(content)
        if (parsed) {
          setParsedManifest(parsed)
        }
      }
      reader.readAsText(file)
    }
  }

  const dependencies = parsedManifest ? extractDependencies(parsedManifest) : []
  const scripts = parsedManifest ? extractScripts(parsedManifest) : { client: [], server: [], shared: [] }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">配置解析器</h1>
            <p className="text-muted-foreground">解析和分析 fxmanifest.lua 文件</p>
          </div>
          <div className="flex gap-2">
            <label>
              <Button variant="outline" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  上传文件
                </span>
              </Button>
              <input
                type="file"
                accept=".lua"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            <Button onClick={handleParse}>
              <FileText className="h-4 w-4 mr-2" />
              解析
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>配置文件内容</CardTitle>
              <CardDescription>粘贴或上传 fxmanifest.lua 内容</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="h-96 font-mono text-sm"
                value={manifestContent}
                onChange={(e) => setManifestContent(e.target.value)}
                placeholder="fx_version 'cerulean'&#10;game 'gta5'&#10;..."
              />
              {error && (
                <p className="text-sm text-destructive mt-2">{error}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>解析结果</CardTitle>
              <CardDescription>解析后的配置信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {parsedManifest ? (
                <>
                  <div>
                    <h3 className="font-semibold mb-2">基本信息</h3>
                    <div className="space-y-1 text-sm">
                      {parsedManifest.fx_version && (
                        <div>FX Version: {parsedManifest.fx_version}</div>
                      )}
                      {parsedManifest.game && (
                        <div>Game: {parsedManifest.game}</div>
                      )}
                      {parsedManifest.author && (
                        <div>Author: {parsedManifest.author}</div>
                      )}
                      {parsedManifest.version && (
                        <div>Version: {parsedManifest.version}</div>
                      )}
                    </div>
                  </div>

                  {dependencies.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">依赖 ({dependencies.length})</h3>
                      <div className="space-y-1">
                        {dependencies.map((dep, index) => (
                          <div key={index} className="text-sm p-2 bg-muted rounded">
                            {dep}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-2">脚本</h3>
                    <div className="space-y-2 text-sm">
                      {scripts.client.length > 0 && (
                        <div>
                          <div className="font-medium">客户端脚本 ({scripts.client.length})</div>
                          <div className="pl-4 space-y-1">
                            {scripts.client.map((script, index) => (
                              <div key={index} className="text-muted-foreground">
                                {script}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {scripts.server.length > 0 && (
                        <div>
                          <div className="font-medium">服务端脚本 ({scripts.server.length})</div>
                          <div className="pl-4 space-y-1">
                            {scripts.server.map((script, index) => (
                              <div key={index} className="text-muted-foreground">
                                {script}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {scripts.shared.length > 0 && (
                        <div>
                          <div className="font-medium">共享脚本 ({scripts.shared.length})</div>
                          <div className="pl-4 space-y-1">
                            {scripts.shared.map((script, index) => (
                              <div key={index} className="text-muted-foreground">
                                {script}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  暂无解析结果
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

