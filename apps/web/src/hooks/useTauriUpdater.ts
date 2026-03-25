import { useEffect, useState, useCallback } from 'react'

function isTauri(): boolean {
  return '__TAURI_INTERNALS__' in window
}

export interface UpdateStatus {
  available: boolean
  version?: string
  installing: boolean
}

export function useTauriUpdater() {
  const [status, setStatus] = useState<UpdateStatus>({
    available: false,
    installing: false,
  })

  const installUpdate = useCallback(async () => {
    if (!isTauri()) return

    setStatus((prev) => ({ ...prev, installing: true }))

    try {
      const { check } = await import('@tauri-apps/plugin-updater')
      const { relaunch } = await import('@tauri-apps/plugin-process')
      const update = await check()

      if (update) {
        await update.downloadAndInstall()
        await relaunch()
      }
    } catch (err) {
      console.error('Failed to install update:', err)
      setStatus((prev) => ({ ...prev, installing: false }))
    }
  }, [])

  useEffect(() => {
    if (!isTauri()) return

    async function checkForUpdate() {
      try {
        const { check } = await import('@tauri-apps/plugin-updater')
        const update = await check()

        if (update) {
          setStatus({
            available: true,
            version: update.version,
            installing: false,
          })
        }
      } catch (err) {
        console.error('Update check failed:', err)
      }
    }

    checkForUpdate()
  }, [])

  return { ...status, installUpdate }
}
