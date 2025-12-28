import { Manifest } from '@/types/manifest'

export interface ParsedManifest extends Manifest {
  dependencies?: string[]
  client_scripts?: string[]
  server_scripts?: string[]
  shared_scripts?: string[]
  files?: string[]
}

export function parseManifest(content: string): ParsedManifest | null {
  try {
    const manifest: ParsedManifest = {}

    // 简单的Lua表解析（基础实现）
    const lines = content.split('\n')
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // 跳过注释和空行
      if (!line || line.startsWith('--')) continue

      // 解析 fx_version
      const fxVersionMatch = line.match(/fx_version\s+['"]([^'"]+)['"]/)
      if (fxVersionMatch) {
        manifest.fx_version = fxVersionMatch[1]
        continue
      }

      // 解析 game
      const gameMatch = line.match(/game\s+['"]([^'"]+)['"]/)
      if (gameMatch) {
        manifest.game = gameMatch[1]
        continue
      }

      // 解析 author
      const authorMatch = line.match(/author\s+['"]([^'"]+)['"]/)
      if (authorMatch) {
        manifest.author = authorMatch[1]
        continue
      }

      // 解析 description
      const descMatch = line.match(/description\s+['"]([^'"]+)['"]/)
      if (descMatch) {
        manifest.description = descMatch[1]
        continue
      }

      // 解析 version
      const versionMatch = line.match(/version\s+['"]([^'"]+)['"]/)
      if (versionMatch) {
        manifest.version = versionMatch[1]
        continue
      }

      // 解析数组字段
      const arrayFields = ['client_scripts', 'server_scripts', 'shared_scripts', 'files', 'dependencies']
      for (const field of arrayFields) {
        if (line.includes(`${field} {`)) {
          const items: string[] = []
          let j = i + 1
          while (j < lines.length && !lines[j].trim().includes('}')) {
            const itemLine = lines[j].trim()
            const itemMatch = itemLine.match(/['"]([^'"]+)['"]/)
            if (itemMatch) {
              items.push(itemMatch[1])
            }
            j++
          }
          manifest[field as keyof ParsedManifest] = items as any
          i = j
          break
        }
      }
    }

    return manifest
  } catch (error) {
    console.error('Failed to parse manifest:', error)
    return null
  }
}

export function extractDependencies(manifest: ParsedManifest): string[] {
  return manifest.dependencies || []
}

export function extractScripts(manifest: ParsedManifest): {
  client: string[]
  server: string[]
  shared: string[]
} {
  return {
    client: manifest.client_scripts || [],
    server: manifest.server_scripts || [],
    shared: manifest.shared_scripts || [],
  }
}

