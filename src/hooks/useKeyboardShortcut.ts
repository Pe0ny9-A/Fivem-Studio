import { useEffect } from 'react'

export function useKeyboardShortcut(
  key: string,
  callback: (e: KeyboardEvent) => void,
  options?: {
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    meta?: boolean
  }
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrlMatch = options?.ctrl ? e.ctrlKey : !e.ctrlKey
      const shiftMatch = options?.shift ? e.shiftKey : !e.shiftKey
      const altMatch = options?.alt ? e.altKey : !e.altKey
      const metaMatch = options?.meta ? e.metaKey : !e.metaKey

      if (
        e.key.toLowerCase() === key.toLowerCase() &&
        ctrlMatch &&
        shiftMatch &&
        altMatch &&
        metaMatch
      ) {
        // 如果焦点在输入框，不触发
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return
        }
        callback(e)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, callback, options])
}

