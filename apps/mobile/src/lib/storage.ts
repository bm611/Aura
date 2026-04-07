import AsyncStorage from '@react-native-async-storage/async-storage'
import type { TreeNode } from '@folio/shared'

function treeKey(userId: string) {
  return `canvas-tree:${userId}`
}
function pendingUpsertsKey(userId: string) {
  return `canvas-pending-upserts:${userId}`
}
function pendingDeletesKey(userId: string) {
  return `canvas-pending-delete:${userId}`
}

export async function getTree(userId: string): Promise<TreeNode[] | null> {
  try {
    const raw = await AsyncStorage.getItem(treeKey(userId))
    if (!raw) return null
    return JSON.parse(raw) as TreeNode[]
  } catch {
    return null
  }
}

export function saveTree(userId: string, tree: TreeNode[]): void {
  AsyncStorage.setItem(treeKey(userId), JSON.stringify(tree)).catch(() => {})
}

export function clearTree(userId: string): void {
  AsyncStorage.removeItem(treeKey(userId)).catch(() => {})
}

export async function getPendingUpserts(userId: string): Promise<Record<string, unknown>[]> {
  try {
    const raw = await AsyncStorage.getItem(pendingUpsertsKey(userId))
    if (!raw) return []
    return JSON.parse(raw) as Record<string, unknown>[]
  } catch {
    return []
  }
}

export function savePendingUpserts(userId: string, items: Record<string, unknown>[]): void {
  AsyncStorage.setItem(pendingUpsertsKey(userId), JSON.stringify(items)).catch(() => {})
}

export async function getPendingDeletes(userId: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(pendingDeletesKey(userId))
    if (!raw) return []
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

export function savePendingDeletes(userId: string, ids: string[]): void {
  AsyncStorage.setItem(pendingDeletesKey(userId), JSON.stringify(ids)).catch(() => {})
}
