import { useEffect } from 'react'

function isTauri(): boolean {
  return '__TAURI_INTERNALS__' in window
}

export function useTauriGlobalShortcut(onQuickCapture: () => void): void {
  useEffect(() => {
    if (!isTauri()) return

    let cleanup: (() => void) | null = null

    async function register() {
      const { register, unregister } = await import('@tauri-apps/plugin-global-shortcut')
      const { getCurrentWindow } = await import('@tauri-apps/api/window')

      const shortcut = 'CmdOrCtrl+Shift+N'

      await register(shortcut, async () => {
        const win = getCurrentWindow()
        await win.show()
        await win.unminimize()
        await win.setFocus()
        onQuickCapture()
      })

      cleanup = () => {
        unregister(shortcut).catch(console.error)
      }
    }

    register().catch(console.error)

    return () => {
      cleanup?.()
    }
  }, [onQuickCapture])
}
