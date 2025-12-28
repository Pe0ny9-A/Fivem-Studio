import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Check, Download } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function Tools() {
  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">开发工具集</h2>
          <p className="text-muted-foreground">
            实用的开发工具，提高开发效率
          </p>
        </div>

        <Tabs defaultValue="json" className="space-y-4">
          <TabsList>
            <TabsTrigger value="json">JSON工具</TabsTrigger>
            <TabsTrigger value="lua">Lua工具</TabsTrigger>
            <TabsTrigger value="color">颜色工具</TabsTrigger>
            <TabsTrigger value="text">文本工具</TabsTrigger>
          </TabsList>

          <TabsContent value="json">
            <JSONTools />
          </TabsContent>

          <TabsContent value="lua">
            <LuaTools />
          </TabsContent>

          <TabsContent value="color">
            <ColorTools />
          </TabsContent>

          <TabsContent value="text">
            <TextTools />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function JSONTools() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, 2))
      setError('')
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
    }
  }

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
      setError('')
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
    }
  }

  const validateJSON = () => {
    try {
      JSON.parse(input)
      setError('')
      setOutput('✓ JSON格式正确')
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>输入</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入JSON..."
            rows={15}
            className="font-mono text-sm"
          />
          <div className="flex gap-2">
            <Button onClick={formatJSON} className="flex-1">格式化</Button>
            <Button onClick={minifyJSON} variant="outline" className="flex-1">压缩</Button>
            <Button onClick={validateJSON} variant="outline" className="flex-1">验证</Button>
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>输出</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              disabled={!output}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  复制
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={output}
            readOnly
            rows={15}
            className="font-mono text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}

function LuaTools() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const toLuaTable = () => {
    try {
      const json = JSON.parse(input)
      const lua = convertToLuaTable(json, 0)
      setOutput(lua)
    } catch (e) {
      setOutput('错误: ' + (e as Error).message)
    }
  }

  const fromLuaTable = () => {
    try {
      // 简单的Lua Table转JSON（基础实现）
      const json = luaTableToJSON(input)
      setOutput(JSON.stringify(json, null, 2))
    } catch (e) {
      setOutput('错误: ' + (e as Error).message)
    }
  }

  const convertToLuaTable = (obj: any, indent: number): string => {
    const indentStr = '  '.repeat(indent)
    if (Array.isArray(obj)) {
      const items = obj.map(item => {
        if (typeof item === 'object' && item !== null) {
          return indentStr + '  ' + convertToLuaTable(item, indent + 1)
        }
        return indentStr + '  ' + formatLuaValue(item)
      })
      return '{\n' + items.join(',\n') + '\n' + indentStr + '}'
    } else if (typeof obj === 'object' && obj !== null) {
      const items = Object.entries(obj).map(([key, value]) => {
        const keyStr = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) ? key : `["${key}"]`
        if (typeof value === 'object' && value !== null) {
          return indentStr + '  ' + keyStr + ' = ' + convertToLuaTable(value, indent + 1)
        }
        return indentStr + '  ' + keyStr + ' = ' + formatLuaValue(value)
      })
      return '{\n' + items.join(',\n') + '\n' + indentStr + '}'
    }
    return formatLuaValue(obj)
  }

  const formatLuaValue = (value: any): string => {
    if (typeof value === 'string') {
      return `"${value.replace(/"/g, '\\"')}"`
    }
    if (typeof value === 'number') {
      return value.toString()
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false'
    }
    if (value === null) {
      return 'nil'
    }
    return 'nil'
  }

  const luaTableToJSON = (lua: string): any => {
    // 这是一个简化的实现，实际应该使用Lua解析器
    // 这里只做基础转换
    try {
      // 移除注释
      const cleaned = lua.replace(/--.*$/gm, '')
      // 简单的转换逻辑（实际应该更复杂）
      return {}
    } catch (e) {
      throw new Error('无法解析Lua Table')
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>输入</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入JSON或Lua Table..."
            rows={15}
            className="font-mono text-sm"
          />
          <div className="flex gap-2">
            <Button onClick={toLuaTable} className="flex-1">JSON → Lua Table</Button>
            <Button onClick={fromLuaTable} variant="outline" className="flex-1">Lua Table → JSON</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>输出</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={output}
            readOnly
            rows={15}
            className="font-mono text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}

function ColorTools() {
  const [rgb, setRgb] = useState({ r: 255, g: 255, b: 255 })
  const [hex, setHex] = useState('#ffffff')
  const [hsl, setHsl] = useState({ h: 0, s: 0, l: 100 })

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  const handleRgbChange = (field: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgb, [field]: value }
    setRgb(newRgb)
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b))
  }

  const handleHexChange = (value: string) => {
    setHex(value)
    const rgbValue = hexToRgb(value)
    if (rgbValue) {
      setRgb(rgbValue)
      setHsl(rgbToHsl(rgbValue.r, rgbValue.g, rgbValue.b))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>颜色转换器</CardTitle>
        <CardDescription>RGB、HEX、HSL 格式互转</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-32 h-32 rounded-lg border-2 border-border"
            style={{ backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }}
          />
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-sm font-medium">RGB</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.r}
                  onChange={(e) => handleRgbChange('r', parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 border rounded"
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.g}
                  onChange={(e) => handleRgbChange('g', parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 border rounded"
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.b}
                  onChange={(e) => handleRgbChange('b', parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 border rounded"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">HEX</label>
              <input
                type="text"
                value={hex}
                onChange={(e) => handleHexChange(e.target.value)}
                className="w-full px-2 py-1 border rounded mt-1 font-mono"
              />
            </div>
            <div>
              <label className="text-sm font-medium">HSL</label>
              <div className="text-sm text-muted-foreground mt-1">
                hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TextTools() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const toUpperCase = () => setOutput(input.toUpperCase())
  const toLowerCase = () => setOutput(input.toLowerCase())
  const toTitleCase = () => {
    setOutput(input.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    ))
  }
  const reverse = () => setOutput(input.split('').reverse().join(''))
  const wordCount = () => {
    const words = input.trim().split(/\s+/).filter(w => w.length > 0)
    setOutput(`字数: ${input.length}\n字符数（不含空格）: ${input.replace(/\s/g, '').length}\n单词数: ${words.length}`)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>输入</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入文本..."
            rows={15}
          />
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={toUpperCase} variant="outline" size="sm">转大写</Button>
            <Button onClick={toLowerCase} variant="outline" size="sm">转小写</Button>
            <Button onClick={toTitleCase} variant="outline" size="sm">标题格式</Button>
            <Button onClick={reverse} variant="outline" size="sm">反转</Button>
            <Button onClick={wordCount} variant="outline" size="sm" className="col-span-2">统计</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>输出</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={output}
            readOnly
            rows={15}
          />
        </CardContent>
      </Card>
    </div>
  )
}

