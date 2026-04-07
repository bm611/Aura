import { useCallback, useMemo, useState } from 'react'
import type { TreeNode, FlatNode, NoteFile, NoteFolder } from '@folio/shared'
import { insertNode as treeInsertNode } from '@folio/shared'

export interface TreeManagerResult {
  tree: TreeNode[]
  setTree: (tree: TreeNode[]) => void
  findNode: (id: string) => TreeNode | null
  getParentId: (nodeId: string) => string | null
  insertNode: (parentId: string | null, newNode: TreeNode) => void
  deleteNode: (id: string) => void
  renameNode: (id: string, name: string) => void
  updateNode: (id: string, updates: Partial<TreeNode> & Record<string, unknown>) => void
  moveNode: (nodeId: string, newParentId: string | null) => void
  collectSubtreeIds: (id: string) => string[]
  flattenNodesForSync: () => FlatNode[]
}

function buildMaps(tree: TreeNode[]): { nodeMap: Map<string, TreeNode>; parentMap: Map<string, string> } {
  const nodeMap = new Map<string, TreeNode>()
  const parentMap = new Map<string, string>()

  const traverse = (nodes: TreeNode[], parentId: string | null) => {
    for (const node of nodes) {
      nodeMap.set(node.id, node)
      if (parentId !== null) parentMap.set(node.id, parentId)
      if (node.type === 'folder' && node.children) traverse(node.children, node.id)
    }
  }
  traverse(tree, null)
  return { nodeMap, parentMap }
}

function buildFlatNodes(tree: TreeNode[], parentId: string | null = null): FlatNode[] {
  let result: FlatNode[] = []
  for (const node of tree) {
    const { children: _, ...rest } = node as TreeNode & { children?: TreeNode[] }
    result.push({ ...rest, parentId } as FlatNode)
    if (node.type === 'folder' && node.children?.length) {
      result = result.concat(buildFlatNodes(node.children, node.id))
    }
  }
  return result
}

function doDeleteNode(tree: TreeNode[], id: string): TreeNode[] {
  return tree
    .filter((node) => node.id !== id)
    .map((node) =>
      'children' in node && node.children ? { ...node, children: doDeleteNode(node.children, id) } : node
    )
}

function doRenameNode(tree: TreeNode[], id: string, name: string): TreeNode[] {
  return tree.map((node) => {
    if (node.id === id) return { ...node, name, title: name }
    if ('children' in node && node.children) return { ...node, children: doRenameNode(node.children, id, name) }
    return node
  })
}

function doUpdateNode(tree: TreeNode[], id: string, updates: Partial<TreeNode> & Record<string, unknown>): TreeNode[] {
  return tree.map((node) => {
    if (node.id === id) return { ...node, ...updates } as TreeNode
    if ('children' in node && node.children) return { ...node, children: doUpdateNode(node.children, id, updates) } as TreeNode
    return node
  })
}

function doCollectSubtreeIds(nodeMap: Map<string, TreeNode>, id: string): string[] {
  const node = nodeMap.get(id)
  if (!node) return []
  const ids: string[] = [id]
  if (node.type === 'folder' && node.children) {
    for (const child of node.children) ids.push(...doCollectSubtreeIds(nodeMap, child.id))
  }
  return ids
}

function doMoveNode(tree: TreeNode[], nodeMap: Map<string, TreeNode>, nodeId: string, newParentId: string | null): TreeNode[] {
  const subtreeIds = new Set(doCollectSubtreeIds(nodeMap, nodeId))
  if (newParentId !== null && subtreeIds.has(newParentId)) return tree
  const nodeToMove = nodeMap.get(nodeId)
  if (!nodeToMove) return tree
  const treeWithoutNode = doDeleteNode(tree, nodeId)
  return treeInsertNode(treeWithoutNode, newParentId, { ...nodeToMove, parentId: newParentId } as TreeNode)
}

export function useTreeManager(initialTree: TreeNode[] = []): TreeManagerResult {
  const [tree, setTreeState] = useState<TreeNode[]>(initialTree)
  const { nodeMap, parentMap } = useMemo(() => buildMaps(tree), [tree])
  const flatNodes = useMemo(() => buildFlatNodes(tree), [tree])

  const setTree = useCallback((newTree: TreeNode[]) => setTreeState(newTree), [])

  const findNode = useCallback((id: string) => nodeMap.get(id) ?? null, [nodeMap])
  const getParentId = useCallback((nodeId: string) => parentMap.get(nodeId) ?? null, [parentMap])
  const insertNode = useCallback((parentId: string | null, newNode: TreeNode) => {
    setTreeState((prev) => treeInsertNode(prev, parentId, newNode))
  }, [])
  const deleteNode = useCallback((id: string) => {
    setTreeState((prev) => doDeleteNode(prev, id))
  }, [])
  const renameNode = useCallback((id: string, name: string) => {
    setTreeState((prev) => doRenameNode(prev, id, name))
  }, [])
  const updateNode = useCallback((id: string, updates: Partial<TreeNode> & Record<string, unknown>) => {
    setTreeState((prev) => doUpdateNode(prev, id, updates))
  }, [])
  const moveNode = useCallback((nodeId: string, newParentId: string | null) => {
    setTreeState((prev) => {
      const { nodeMap: snap } = buildMaps(prev)
      return doMoveNode(prev, snap, nodeId, newParentId)
    })
  }, [])
  const collectSubtreeIds = useCallback((id: string) => doCollectSubtreeIds(nodeMap, id), [nodeMap])
  const flattenNodesForSync = useCallback(() => flatNodes, [flatNodes])

  return useMemo(
    () => ({ tree, setTree, findNode, getParentId, insertNode, deleteNode, renameNode, updateNode, moveNode, collectSubtreeIds, flattenNodesForSync }),
    [tree, setTree, findNode, getParentId, insertNode, deleteNode, renameNode, updateNode, moveNode, collectSubtreeIds, flattenNodesForSync]
  )
}

export type { TreeNode, FlatNode, NoteFile, NoteFolder }
