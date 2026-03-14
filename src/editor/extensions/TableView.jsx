import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import { useCallback, useRef } from 'react'
import { IconPlus } from '@tabler/icons-react'

function TableView({ editor, node, getPos }) {
  const gridRef = useRef(null)

  const addRowAfter = useCallback(() => {
    const tablePos = getPos()
    if (tablePos == null) return
    let lastRowOffset = 0
    node.forEach((child, offset) => {
      if (child.type.name === 'tableRow') lastRowOffset = offset
    })
    editor.chain().setTextSelection(tablePos + 1 + lastRowOffset + 1 + 1).addRowAfter().run()
  }, [editor, getPos, node])

  const addColumnAfter = useCallback(() => {
    const tablePos = getPos()
    if (tablePos == null) return
    const firstRow = node.firstChild
    if (!firstRow) return
    let lastCellOffset = 0
    firstRow.forEach((_, offset) => { lastCellOffset = offset })
    editor.chain().setTextSelection(tablePos + 1 + 0 + 1 + lastCellOffset + 1).addColumnAfter().run()
  }, [editor, getPos, node])

  return (
    <NodeViewWrapper className="table-wrapper">
      <div
        className="table-container"
        style={{
          display: 'inline-grid',
          gridTemplateColumns: 'max-content min-content',
          gridTemplateRows: 'auto auto',
          columnGap: '4px',
          rowGap: '4px',
        }}
      >
        {/* (row 1, col 1) — the table */}
        <div
          ref={gridRef}
          style={{ gridColumn: 1, gridRow: 1, overflowX: 'auto', position: 'relative' }}
        >
          <NodeViewContent
            as="table"
            style={{ borderCollapse: 'collapse', tableLayout: 'auto' }}
          />
        </div>

        {/* (rows 1-2, col 2) — add column, spans full height */}
        <button
          type="button"
          contentEditable={false}
          onClick={addColumnAfter}
          className="table-add-button table-add-column"
          style={{
            gridColumn: 2,
            gridRow: '1 / 3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 6px',
            border: '1px dashed var(--border-subtle)',
            borderRadius: '6px',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            opacity: 0,
            transition: 'opacity 0.15s ease',
          }}
        >
          <IconPlus size={16} stroke={1.5} />
        </button>

        {/* (row 2, col 1) — add row, exactly as wide as the table */}
        <button
          type="button"
          contentEditable={false}
          onClick={addRowAfter}
          className="table-add-button table-add-row"
          style={{
            gridColumn: 1,
            gridRow: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            border: '1px dashed var(--border-subtle)',
            borderRadius: '6px',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            opacity: 0,
            transition: 'opacity 0.15s ease',
          }}
        >
          <IconPlus size={16} stroke={1.5} />
        </button>
      </div>

      <style>{`
        .table-wrapper {
          position: relative;
          overflow-x: auto;
        }
        .table-wrapper:hover .table-add-button {
          opacity: 0.5 !important;
        }
        .table-add-button:hover {
          opacity: 1 !important;
          background: var(--bg-hover) !important;
          color: var(--text-primary) !important;
        }
        /* Override global width:100% so the table sizes to its content */
        .table-wrapper table {
          width: auto !important;
        }
        .table-wrapper table td,
        .table-wrapper table th {
          min-width: 80px;
          padding: 0.5rem 0.75rem;
        }
      `}</style>
    </NodeViewWrapper>
  )
}

export default TableView
