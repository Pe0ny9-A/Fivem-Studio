export interface LintError {
  line: number
  column: number
  message: string
  severity: 'error' | 'warning' | 'info'
  rule: string
}

export function lintLuaCode(code: string): LintError[] {
  const errors: LintError[] = []
  const lines = code.split('\n')

  lines.forEach((line, lineIndex) => {
    const lineNum = lineIndex + 1

    // 检查未闭合的字符串
    const singleQuotes = (line.match(/'/g) || []).length
    const doubleQuotes = (line.match(/"/g) || []).length
    
    if (singleQuotes % 2 !== 0 && !line.includes("'") || singleQuotes % 2 !== 0) {
      errors.push({
        line: lineNum,
        column: line.indexOf("'"),
        message: '未闭合的单引号字符串',
        severity: 'error',
        rule: 'unclosed-string',
      })
    }

    if (doubleQuotes % 2 !== 0) {
      errors.push({
        line: lineNum,
        column: line.indexOf('"'),
        message: '未闭合的双引号字符串',
        severity: 'error',
        rule: 'unclosed-string',
      })
    }

    // 检查未闭合的括号
    const openParens = (line.match(/\(/g) || []).length
    const closeParens = (line.match(/\)/g) || []).length
    if (openParens !== closeParens && line.trim()) {
      errors.push({
        line: lineNum,
        column: 0,
        message: `括号不匹配 (${openParens} 个开括号, ${closeParens} 个闭括号)`,
        severity: 'warning',
        rule: 'unmatched-parens',
      })
    }

    // 检查常见错误
    if (line.includes('===') || line.includes('!==')) {
      errors.push({
        line: lineNum,
        column: line.indexOf('===') !== -1 ? line.indexOf('===') : line.indexOf('!=='),
        message: 'Lua 使用 == 和 ~= 而不是 === 和 !==',
        severity: 'error',
        rule: 'wrong-operator',
      })
    }

    // 检查未使用的变量（简单检查）
    if (line.match(/local\s+(\w+)\s*=\s*[^=]/) && !line.includes('--')) {
      const match = line.match(/local\s+(\w+)/)
      if (match) {
        const varName = match[1]
        // 检查变量是否在后续代码中使用（简单检查）
        const remainingCode = lines.slice(lineIndex + 1).join('\n')
        if (!remainingCode.includes(varName) && !varName.startsWith('_')) {
          errors.push({
            line: lineNum,
            column: line.indexOf(varName),
            message: `变量 '${varName}' 可能未使用`,
            severity: 'warning',
            rule: 'unused-variable',
          })
        }
      }
    }

    // 检查缩进（简单检查）
    if (line.trim() && !line.startsWith('--')) {
      const expectedIndent = getExpectedIndent(lines, lineIndex)
      const actualIndent = line.match(/^(\s*)/)?.[1].length || 0
      if (actualIndent < expectedIndent && expectedIndent > 0) {
        errors.push({
          line: lineNum,
          column: 0,
          message: '缩进可能不正确',
          severity: 'info',
          rule: 'indentation',
        })
      }
    }
  })

  // 检查未闭合的块
  const blocks = checkUnclosedBlocks(code)
  errors.push(...blocks)

  return errors
}

function getExpectedIndent(lines: string[], currentIndex: number): number {
  if (currentIndex === 0) return 0

  const prevLine = lines[currentIndex - 1].trim()
  if (prevLine.endsWith('then') || prevLine.endsWith('do') || prevLine.endsWith('{')) {
    return (lines[currentIndex - 1].match(/^(\s*)/)?.[1].length || 0) + 2
  }
  return lines[currentIndex - 1].match(/^(\s*)/)?.[1].length || 0
}

function checkUnclosedBlocks(code: string): LintError[] {
  const errors: LintError[] = []
  const lines = code.split('\n')
  
  let openBlocks = 0
  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (trimmed.match(/^(if|function|for|while|repeat)\s/)) {
      openBlocks++
    }
    if (trimmed === 'end' || trimmed.endsWith(' end')) {
      openBlocks--
    }
  })

  if (openBlocks > 0) {
    errors.push({
      line: lines.length,
      column: 0,
      message: `可能有 ${openBlocks} 个未闭合的代码块`,
      severity: 'warning',
      rule: 'unclosed-blocks',
    })
  }

  return errors
}

