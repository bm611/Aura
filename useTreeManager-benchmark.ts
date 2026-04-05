import { TreeNode, NoteFolder, NoteFile, FlatNode } from './apps/web/src/hooks/useTreeManager'

function buildMaps(tree: TreeNode[]): { nodeMap: Map<string, TreeNode>, parentMap: Map<string, string> } {
  const nodeMap = new Map<string, TreeNode>()
  const parentMap = new Map<string, string>()

  const traverse = (nodes: TreeNode[], parentId: string | null) => {
    for (const node of nodes) {
      nodeMap.set(node.id, node)
      if (parentId !== null) {
        parentMap.set(node.id, parentId)
      }
      if (node.type === 'folder' && node.children) {
        traverse(node.children, node.id)
      }
    }
  }
  traverse(tree, null)
  return { nodeMap, parentMap }
}

function doGetParentId_new(parentMap: Map<string, string>, nodeId: string): string | null {
  return parentMap.get(nodeId) ?? null
}

function generateLargeTree(depth: number, width: number, currentId = 'root'): TreeNode[] {
  if (depth === 0) {
    return Array.from({ length: width }).map((_, i) => ({
      id: `${currentId}-file-${i}`,
      type: 'file',
      name: `File ${i}`,
      title: `File ${i}`,
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as NoteFile))
  }

  return Array.from({ length: width }).map((_, i) => {
    const folderId = `${currentId}-folder-${i}`
    return {
      id: folderId,
      type: 'folder',
      name: `Folder ${i}`,
      children: generateLargeTree(depth - 1, width, folderId),
    } as NoteFolder
  })
}

const tree = generateLargeTree(5, 5) // 5^5 nodes
const { nodeMap, parentMap } = buildMaps(tree)
const targetNodeId = 'root-folder-4-folder-4-folder-4-folder-4-folder-4-file-4'

console.log(`Total nodes in map: ${nodeMap.size}`)

const start = performance.now()
const iterations = 1000
for (let i = 0; i < iterations; i++) {
  doGetParentId_new(parentMap, targetNodeId)
}
const end = performance.now()

console.log(`doGetParentId_new took ${end - start}ms for ${iterations} iterations`)
