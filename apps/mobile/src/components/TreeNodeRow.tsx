import type { TreeNode, NoteFile, NoteFolder } from '@folio/shared'
import FileRow from './FileRow'
import FolderRow from './FolderRow'

interface Props {
  node: TreeNode
  depth: number
  isExpanded: boolean
  onFilePress: (note: NoteFile) => void
  onFolderPress: (folder: NoteFolder) => void
  onLongPress: (node: TreeNode) => void
}

export default function TreeNodeRow({ node, depth, isExpanded, onFilePress, onFolderPress, onLongPress }: Props) {
  if (node.type === 'file') {
    return (
      <FileRow
        note={node as NoteFile}
        depth={depth}
        onPress={() => onFilePress(node as NoteFile)}
        onLongPress={() => onLongPress(node)}
      />
    )
  }

  return (
    <FolderRow
      folder={node as NoteFolder}
      depth={depth}
      isExpanded={isExpanded}
      onPress={() => onFolderPress(node as NoteFolder)}
      onLongPress={() => onLongPress(node)}
    />
  )
}
