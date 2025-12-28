import { Manifest } from '@/types/manifest'

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

export function validateManifest(manifest: Partial<Manifest>): ValidationError[] {
  const errors: ValidationError[] = []

  // 必填字段检查
  if (!manifest.fx_version) {
    errors.push({
      field: 'fx_version',
      message: 'fx_version 是必填字段',
      severity: 'error',
    })
  }

  if (!manifest.game) {
    errors.push({
      field: 'game',
      message: 'game 是必填字段',
      severity: 'error',
    })
  }

  // fx_version 验证
  if (manifest.fx_version && !['cerulean', 'bodacious', 'adamant'].includes(manifest.fx_version)) {
    errors.push({
      field: 'fx_version',
      message: 'fx_version 应该是 cerulean, bodacious 或 adamant',
      severity: 'warning',
    })
  }

  // game 验证
  if (manifest.game && manifest.game !== 'gta5') {
    errors.push({
      field: 'game',
      message: 'game 目前只支持 gta5',
      severity: 'warning',
    })
  }

  // 脚本文件路径验证
  const scriptFields = [
    'client_scripts',
    'server_scripts',
    'shared_scripts',
  ] as const

  scriptFields.forEach(field => {
    const scripts = manifest[field]
    if (scripts && Array.isArray(scripts)) {
      scripts.forEach((script, index) => {
        if (typeof script !== 'string') {
          errors.push({
            field: `${field}[${index}]`,
            message: '脚本路径必须是字符串',
            severity: 'error',
          })
        } else if (!script.match(/\.(lua|js)$/i)) {
          errors.push({
            field: `${field}[${index}]`,
            message: '脚本文件应该是 .lua 或 .js 文件',
            severity: 'warning',
          })
        }
      })
    }
  })

  // 依赖验证
  if (manifest.dependencies && Array.isArray(manifest.dependencies)) {
    manifest.dependencies.forEach((dep, index) => {
      if (typeof dep !== 'string') {
        errors.push({
          field: `dependencies[${index}]`,
          message: '依赖项必须是字符串',
          severity: 'error',
        })
      }
    })
  }

  // 版本号验证
  if (manifest.version) {
    const versionRegex = /^\d+\.\d+\.\d+$/
    if (!versionRegex.test(manifest.version)) {
      errors.push({
        field: 'version',
        message: '版本号格式应为 x.y.z (例如: 1.0.0)',
        severity: 'warning',
      })
    }
  }

  return errors
}

