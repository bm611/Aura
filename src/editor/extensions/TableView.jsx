import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import { useState, useCallback, useRef, useEffect } from 'react'
import { IconPlus, IconGripVertical, IconGripHorizontal, IconGridDots } from '@tabler/icons-react'
import { CellSelection, TableMap } from '@tiptap/pm/tables'

// Tiptap passes node + getPos to React NodeView components
function TableView({ editor, node, getPos }) {
  // Track the hovered <tr> (for the row delete handle)
  // and the hovered <td>/<th> (for the column delete handle position)
  const [hoveredRow, setHoveredRow] = useState(null)
  const [hoveredCell, setHoveredCell] = useState(null)
  const [gridElement, setGridElement] = useState(null)
  const clearTimerRef = useRef(null)

  // ── Hover persistence ────────────────────────────────────────────────────
  // The row/col delete buttons are position:fixed (outside the DOM flow).
  // We use a short timeout so moving the mouse from a cell to a delete button
  // doesn't immediately clear the hover state.

  const scheduleHoverClear = useCallback(() => {
    clearTimerRef.current = setTimeout(() => {
      setHoveredRow(null)
      setHoveredCell(null)
    }, 150)
  }, [])

  const cancelHoverClear = useCallback(() => {
    clearTimeout(clearTimerRef.current)
  }, [])

  useEffect(() => () => clearTimeout(clearTimerRef.current), [])

  const handleMouseOver = useCallback((e) => {
    cancelHoverClear()
    const cell = e.target.closest('td, th')
    if (cell) {
      setHoveredRow(cell.closest('tr'))
      setHoveredCell(cell)
    }
  }, [cancelHoverClear])

  const handleMouseLeave = useCallback(() => {
    scheduleHoverClear()
  }, [scheduleHoverClear])

  // ── Add row / column ─────────────────────────────────────────────────────
  // These require the cursor to be inside a table cell before running.
  // We use getPos + node to place the cursor at the right cell first.

  const addRowAfter = useCallback(() => {
    const tablePos = getPos()
    if (tablePos == null) return
    let lastRowOffset = 0
    node.forEach((child, offset) => {
      if (child.type.name === 'tableRow') lastRowOffset = offset
    })
    // tablePos+1 (enter table) + lastRowOffset + 1 (enter row) + 1 (enter first cell)
    editor.chain().setTextSelection(tablePos + 1 + lastRowOffset + 1 + 1).addRowAfter().run()
  }, [editor, getPos, node])

  const addColumnAfter = useCallback(() => {
    const tablePos = getPos()
    if (tablePos == null) return
    const firstRow = node.firstChild
    if (!firstRow) return
    let lastCellOffset = 0
    firstRow.forEach((_, offset) => { lastCellOffset = offset })
    // tablePos+1 (enter table) + 0 (first row) + 1 (enter row) + lastCellOffset + 1 (enter last cell)
    editor.chain().setTextSelection(tablePos + 1 + 0 + 1 + lastCellOffset + 1).addColumnAfter().run()
  }, [editor, getPos, node])

  // ── Helper: find cell pos from a DOM element ─────────────────────────────
  // posAtDOM returns a position inside the cell content. Walk up the resolved
  // position's depth to find the cell node, then return the position just
  // before it (which "points at" the cell in its parent row).

  const resolveCellPos = useCallback((domCell) => {
    const pos = editor.view.posAtDOM(domCell, 0)
    const $pos = editor.state.doc.resolve(pos)
    for (let d = $pos.depth; d > 0; d--) {
      const role = $pos.node(d).type.spec.tableRole
      if (role === 'cell' || role === 'header_cell') {
        return editor.state.doc.resolve($pos.before(d))
      }
    }
    return null
  }, [editor])

  // ── Select row ───────────────────────────────────────────────────────────

  const selectRow = useCallback(() => {
    if (!hoveredRow) return
    const firstCell = hoveredRow.querySelector('td, th')
    if (!firstCell) return
    try {
      const $cell = resolveCellPos(firstCell)
      if (!$cell) return
      const sel = CellSelection.rowSelection($cell)
      editor.view.dispatch(editor.state.tr.setSelection(sel))
    } catch (e) {
      console.error(e)
    }
  }, [editor, hoveredRow, resolveCellPos])

  // ── Select column ────────────────────────────────────────────────────────

  const selectColumn = useCallback(() => {
    if (!hoveredCell) return
    try {
      const $cell = resolveCellPos(hoveredCell)
      if (!$cell) return
      const sel = CellSelection.colSelection($cell)
      editor.view.dispatch(editor.state.tr.setSelection(sel))
    } catch (e) {
      console.error(e)
    }
  }, [editor, hoveredCell, resolveCellPos])

  // ── Select table ─────────────────────────────────────────────────────────

  const selectTable = useCallback(() => {
    try {
      const tablePos = getPos()
      if (tablePos == null) return
      
      const map = TableMap.get(node)
      const start = tablePos + 1
      const firstCellPos = map.map[0]
      const lastCellPos = map.map[map.map.length - 1]

      editor.commands.setCellSelection({ 
        anchorCell: start + firstCellPos, 
        headCell: start + lastCellPos 
      })
    } catch (e) {
      console.error(e)
    }
  }, [editor, getPos, node])

  // ── Floating handle positions ────────────────────────────────────────────

  const rowHandlePos = hoveredRow ? (() => {
    const r = hoveredRow.getBoundingClientRect()
    return { top: r.top + r.height / 2 - 10, left: r.left - 26 }
  })() : null

  const colHandlePos = hoveredCell && gridElement ? (() => {
    const c = hoveredCell.getBoundingClientRect()
    const t = gridElement.getBoundingClientRect()
    return { top: t.top - 26, left: c.left + c.width / 2 - 10 }
  })() : null

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <NodeViewWrapper className="table-wrapper">

      {/* Select row handle — floats to the left of the hovered row */}
      {rowHandlePos && (
        <button
          type="button"
          contentEditable={false}
          title="Select row"
          onClick={selectRow}
          onMouseEnter={cancelHoverClear}
          onMouseLeave={scheduleHoverClear}
          className="table-handle"
          style={{
            position: 'fixed',
            top: rowHandlePos.top,
            left: rowHandlePos.left,
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            borderRadius: '4px',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            zIndex: 200,
            opacity: 0.5,
            transition: 'opacity 0.15s ease, background 0.15s ease',
          }}
        >
          <IconGripVertical size={14} stroke={2} />
        </button>
      )}

      {/* Select column handle — floats above the hovered column */}
      {colHandlePos && (
        <button
          type="button"
          contentEditable={false}
          title="Select column"
          onClick={selectColumn}
          onMouseEnter={cancelHoverClear}
          onMouseLeave={scheduleHoverClear}
          className="table-handle"
          style={{
            position: 'fixed',
            top: colHandlePos.top,
            left: colHandlePos.left,
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            borderRadius: '4px',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            zIndex: 200,
            opacity: 0.5,
            transition: 'opacity 0.15s ease, background 0.15s ease',
          }}
        >
          <IconGripHorizontal size={14} stroke={2} />
        </button>
      )}

      {/* CSS Grid layout */}
      <div
        className="table-container"
        style={{
          display: 'inline-grid',
          gridTemplateColumns: 'max-content min-content',
          gridTemplateRows: 'auto auto',
          columnGap: '4px',
          rowGap: '4px',
          position: 'relative', // added to anchor the table handle
        }}
        onMouseOver={handleMouseOver}
        onMouseLeave={handleMouseLeave}
      >
        {/* Select table — absolutely above the table's top-left corner */}
        <button
          type="button"
          contentEditable={false}
          title="Select table"
          onClick={selectTable}
          className="table-select-table-btn table-handle"
          style={{
            position: 'absolute',
            top: -14,
            left: -14,
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            borderRadius: '4px',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            opacity: 0,
            transition: 'opacity 0.15s ease, background 0.15s ease',
            zIndex: 100,
          }}
        >
          <IconGridDots size={14} stroke={2} />
        </button>

        {/* (row 1, col 1) — the table */}
        <div
          ref={setGridElement}
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
        .table-wrapper:hover .table-add-button,
        .table-wrapper:hover .table-select-table-btn {
          opacity: 0.5 !important;
        }
        .table-add-button:hover,
        .table-handle:hover {
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
