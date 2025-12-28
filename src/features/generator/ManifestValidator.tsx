import { useState } from 'react'
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { validateManifest, ValidationError } from '@/utils/manifestValidator'
import { parseManifest } from '@/utils/manifestParser'
import { cn } from '@/utils/cn'

export default function ManifestValidator() {
  const [manifestText, setManifestText] = useState('')
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isValid, setIsValid] = useState<boolean | null>(null)

  const handleValidate = () => {
    try {
      const manifest = parseManifest(manifestText)
      if (!manifest) {
        setErrors([{
          field: 'parse',
          message: '无法解析配置文件',
          severity: 'error',
        }])
        setIsValid(false)
        return
      }
      const validationErrors = validateManifest(manifest)
      setErrors(validationErrors)
      setIsValid(validationErrors.filter(e => e.severity === 'error').length === 0)
    } catch (error) {
      setErrors([{
        field: 'parse',
        message: `解析错误: ${(error as Error).message}`,
        severity: 'error',
      }])
      setIsValid(false)
    }
  }

  const getIcon = (severity: ValidationError['severity']) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: ValidationError['severity']) => {
    switch (severity) {
      case 'error':
        return 'border-destructive bg-destructive/10'
      case 'warning':
        return 'border-yellow-500 bg-yellow-500/10'
      case 'info':
        return 'border-blue-500 bg-blue-500/10'
    }
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">配置验证器</h2>
          <p className="text-muted-foreground">
            验证你的 fxmanifest.lua 配置文件，检查错误和最佳实践
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>配置文件</CardTitle>
            <CardDescription>粘贴或输入你的 fxmanifest.lua 内容</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={manifestText}
              onChange={(e) => setManifestText(e.target.value)}
              placeholder="fx_version 'cerulean'&#10;game 'gta5'&#10;..."
              rows={15}
              className="font-mono text-sm"
            />
            <Button onClick={handleValidate} className="w-full">
              验证配置
            </Button>
          </CardContent>
        </Card>

        {isValid !== null && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {isValid ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-green-500">验证通过</CardTitle>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-destructive" />
                    <CardTitle className="text-destructive">发现错误</CardTitle>
                  </>
                )}
              </div>
              <CardDescription>
                发现 {errors.filter(e => e.severity === 'error').length} 个错误，
                {errors.filter(e => e.severity === 'warning').length} 个警告
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
                        <div className="font-medium mb-1">{error.field}</div>
                        <div className="text-sm">{error.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

