import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import './App.css'

// ─── Constants ────────────────────────────────────────────────────────────────
const NUM_COLS = 26
const NUM_ROWS = 100
const COL_WIDTH = 100
const ROW_HEIGHT = 24
const ROW_HDR_W = 46

const COLS = Array.from({ length: NUM_COLS }, (_, i) => String.fromCharCode(65 + i))

const colIdx = (col) => col.charCodeAt(0) - 65
const idxToCol = (i) => String.fromCharCode(65 + i)

const parseCellRef = (ref) => {
  const m = String(ref).match(/^([A-Z]+)(\d+)$/)
  if (!m) return null
  return { col: m[1], row: parseInt(m[2], 10) }
}

// ─── Formula Engine ───────────────────────────────────────────────────────────
const expandRange = (range) => {
  const parts = range.split(':')
  if (parts.length !== 2) return []
  const s = parseCellRef(parts[0].trim())
  const e = parseCellRef(parts[1].trim())
  if (!s || !e) return []
  const refs = []
  for (let r = s.row; r <= e.row; r++)
    for (let ci = colIdx(s.col); ci <= colIdx(e.col); ci++)
      refs.push(`${idxToCol(ci)}${r}`)
  return refs
}

const evaluate = (formula, getData, depth = 0) => {
  if (depth > 20) return '#REF!'
  if (!formula || !formula.startsWith('=')) {
    const n = parseFloat(formula)
    return formula === '' ? '' : (isNaN(n) ? formula : n)
  }

  const expr = formula.slice(1)

  const resolveRef = (ref) => {
    const raw = getData(ref.toUpperCase()) || ''
    if (raw.startsWith('=')) return evaluate(raw, getData, depth + 1)
    const n = parseFloat(raw)
    return raw === '' ? '' : (isNaN(n) ? raw : n)
  }

  const toNum = (v) => {
    if (v === '' || v === null || v === undefined) return 0
    const n = parseFloat(v)
    return isNaN(n) ? 0 : n
  }

  // Function call: NAME(args)
  const fnMatch = expr.match(/^([A-Za-z_][A-Za-z0-9_]*)\(([\s\S]*)\)$/)
  if (fnMatch) {
    const fn = fnMatch[1].toUpperCase()
    const rawArgs = fnMatch[2]

    // Split args by comma (respecting nested parens)
    const argParts = []
    let pd = 0, cur = ''
    for (const ch of rawArgs) {
      if (ch === '(') { pd++; cur += ch }
      else if (ch === ')') { pd--; cur += ch }
      else if (ch === ',' && pd === 0) { argParts.push(cur.trim()); cur = '' }
      else cur += ch
    }
    if (cur.trim()) argParts.push(cur.trim())

    let vals = []
    for (const arg of argParts) {
      if (/^[A-Z]+\d+:[A-Z]+\d+$/i.test(arg)) {
        expandRange(arg.toUpperCase()).forEach(r => vals.push(resolveRef(r)))
      } else if (/^[A-Z]+\d+$/i.test(arg)) {
        vals.push(resolveRef(arg))
      } else {
        const n = parseFloat(arg)
        vals.push(isNaN(n) ? arg.replace(/^"|"$/g, '') : n)
      }
    }

    const nums = vals.map(toNum)

    switch (fn) {
      case 'SUM':         return nums.reduce((a, b) => a + b, 0)
      case 'AVERAGE':
      case 'AVG':         return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0
      case 'MIN':         return nums.length ? Math.min(...nums) : 0
      case 'MAX':         return nums.length ? Math.max(...nums) : 0
      case 'COUNT':       return vals.filter(v => v !== '' && !isNaN(parseFloat(v))).length
      case 'COUNTA':      return vals.filter(v => v !== '' && v !== null).length
      case 'ABS':         return Math.abs(nums[0])
      case 'ROUND':       { const p = Math.pow(10, nums[1] || 0); return Math.round(nums[0] * p) / p }
      case 'FLOOR':       return Math.floor(nums[0])
      case 'CEIL':
      case 'CEILING':     return Math.ceil(nums[0])
      case 'SQRT':        return Math.sqrt(nums[0])
      case 'POWER':       return Math.pow(nums[0], nums[1])
      case 'MOD':         return nums[0] % nums[1]
      case 'IF':          return vals[0] ? (vals[1] ?? '') : (vals[2] ?? '')
      case 'AND':         return vals.every(Boolean) ? 'TRUE' : 'FALSE'
      case 'OR':          return vals.some(Boolean) ? 'TRUE' : 'FALSE'
      case 'NOT':         return !vals[0] ? 'TRUE' : 'FALSE'
      case 'CONCAT':
      case 'CONCATENATE': return vals.join('')
      case 'LEN':         return String(vals[0] ?? '').length
      case 'LEFT':        return String(vals[0] ?? '').slice(0, nums[1] || 1)
      case 'RIGHT':       return String(vals[0] ?? '').slice(-(nums[1] || 1))
      case 'MID':         return String(vals[0] ?? '').slice(nums[1] - 1, nums[1] - 1 + nums[2])
      case 'UPPER':       return String(vals[0] ?? '').toUpperCase()
      case 'LOWER':       return String(vals[0] ?? '').toLowerCase()
      case 'TRIM':        return String(vals[0] ?? '').trim()
      case 'VALUE':       return toNum(vals[0])
      default:            return '#NAME?'
    }
  }

  // Replace cell refs with values, then safely evaluate as arithmetic/string expression
  const substituted = expr.replace(/[A-Z]+\d+/gi, (ref) => {
    const val = resolveRef(ref.toUpperCase())
    if (typeof val === 'string') return JSON.stringify(val)
    return val === '' ? 0 : val
  })

  return safeEval(substituted)
}

// Safe expression evaluator — replaces Function()/eval to prevent code injection.
// Supports: numbers, double-quoted strings, +−×÷%**, ^, &(concat),
//           comparisons (==,!=,<,>,<=,>=), logical (&&,||,!), grouping ().
const safeEval = (expr) => {
  const s = expr
  let pos = 0

  const ws = () => { while (pos < s.length && s[pos] === ' ') pos++ }

  const parseExpr = () => { ws(); return parseOr() }

  const parseOr = () => {
    let v = parseAnd(); ws()
    while (s.slice(pos, pos + 2) === '||') { pos += 2; const r = parseAnd(); v = v || r; ws() }
    return v
  }

  const parseAnd = () => {
    let v = parseCmp(); ws()
    while (s.slice(pos, pos + 2) === '&&') { pos += 2; const r = parseCmp(); v = v && r; ws() }
    return v
  }

  const parseCmp = () => {
    let v = parseConcat(); ws()
    while (true) {
      let op = ''
      if      (s.slice(pos, pos + 3) === '===') op = '==='
      else if (s.slice(pos, pos + 3) === '!==') op = '!=='
      else if (s.slice(pos, pos + 2) === '==')  op = '=='
      else if (s.slice(pos, pos + 2) === '!=')  op = '!='
      else if (s.slice(pos, pos + 2) === '<=')  op = '<='
      else if (s.slice(pos, pos + 2) === '>=')  op = '>='
      else if (s[pos] === '<') op = '<'
      else if (s[pos] === '>') op = '>'
      else break
      pos += op.length
      const r = parseConcat()
      if      (op === '===') v = v === r
      else if (op === '!==') v = v !== r
      else if (op === '==')  v = v == r   // eslint-disable-line eqeqeq
      else if (op === '!=')  v = v != r   // eslint-disable-line eqeqeq
      else if (op === '<=')  v = v <= r
      else if (op === '>=')  v = v >= r
      else if (op === '<')   v = v < r
      else if (op === '>')   v = v > r
      ws()
    }
    return v
  }

  const parseConcat = () => {
    let v = parseAdd(); ws()
    while (s[pos] === '&') { pos++; v = String(v) + String(parseAdd()); ws() }
    return v
  }

  const parseAdd = () => {
    let v = parseMul(); ws()
    while (s[pos] === '+' || s[pos] === '-') {
      const op = s[pos++]; const r = parseMul()
      v = op === '+' ? v + r : v - r; ws()
    }
    return v
  }

  const parseMul = () => {
    let v = parsePow(); ws()
    while (s[pos] === '*' || s[pos] === '/' || s[pos] === '%') {
      const op = s[pos++]; const r = parsePow()
      if (op === '*') v = v * r
      else if (op === '/') v = r === 0 ? Infinity : v / r
      else v = v % r
      ws()
    }
    return v
  }

  const parsePow = () => {
    const base = parseUnary(); ws()
    if (s.slice(pos, pos + 2) === '**' || s[pos] === '^') {
      pos += s[pos] === '^' ? 1 : 2
      return Math.pow(base, parseUnary())
    }
    return base
  }

  const parseUnary = () => {
    ws()
    if (s[pos] === '-') { pos++; return -parseUnary() }
    if (s[pos] === '+') { pos++; return +parseUnary() }
    if (s[pos] === '!') { pos++; return !parseUnary() }
    return parsePrimary()
  }

  const parsePrimary = () => {
    ws()
    if (s[pos] === '"') {
      pos++; let str = ''
      while (pos < s.length && s[pos] !== '"') {
        if (s[pos] === '\\' && pos + 1 < s.length) { pos++ }
        str += s[pos++]
      }
      if (pos < s.length) pos++
      return str
    }
    if (s[pos] === '(') {
      pos++; const v = parseExpr(); ws()
      if (s[pos] === ')') pos++
      return v
    }
    if (s.slice(pos, pos + 4) === 'true')  { pos += 4; return true }
    if (s.slice(pos, pos + 5) === 'false') { pos += 5; return false }
    if (s.slice(pos, pos + 4) === 'null')  { pos += 4; return null }
    const m = s.slice(pos).match(/^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/)
    if (m) { pos += m[0].length; return parseFloat(m[0]) }
    return '#ERROR!'
  }

  try {
    const result = parseExpr()
    return typeof result === 'boolean' ? (result ? 'TRUE' : 'FALSE') : result
  } catch {
    return '#ERROR!'
  }
}

const fmtDisplay = (val) => {
  if (val === '' || val === null || val === undefined) return ''
  if (typeof val === 'number') {
    if (!isFinite(val)) return val > 0 ? '#DIV/0!' : '#NUM!'
    return parseFloat(val.toPrecision(12)).toString()
  }
  return String(val)
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [sheets, setSheets] = useState(['Sheet1', 'Sheet2', 'Sheet3'])
  const [activeSheet, setActiveSheet] = useState('Sheet1')
  // allData: { sheetName: { 'A1': { v, bold, italic, underline, align } } }
  const [allData, setAllData] = useState({ Sheet1: {}, Sheet2: {}, Sheet3: {} })

  const [selCell, setSelCell] = useState({ col: 'A', row: 1 })
  const [selEnd, setSelEnd] = useState(null)   // null = single-cell selection
  const [editCell, setEditCell] = useState(null)
  const [editVal, setEditVal] = useState('')

  const containerRef = useRef(null)
  const editInputRef = useRef(null)
  const formulaBarRef = useRef(null)
  const isDragging = useRef(false)

  const selRef = `${selCell.col}${selCell.row}`
  const editRef = editCell ? `${editCell.col}${editCell.row}` : null
  const sheetData = allData[activeSheet] || {}
  const selCellData = sheetData[selRef] || {}

  // Normalised selection rectangle
  const selRange = useMemo(() => {
    const minC = selEnd ? Math.min(colIdx(selCell.col), colIdx(selEnd.col)) : colIdx(selCell.col)
    const maxC = selEnd ? Math.max(colIdx(selCell.col), colIdx(selEnd.col)) : colIdx(selCell.col)
    const minR = selEnd ? Math.min(selCell.row, selEnd.row) : selCell.row
    const maxR = selEnd ? Math.max(selCell.row, selEnd.row) : selCell.row
    return { minC, maxC, minR, maxR }
  }, [selCell, selEnd])

  const inSel = useCallback((col, row) => {
    const ci = colIdx(col)
    return ci >= selRange.minC && ci <= selRange.maxC && row >= selRange.minR && row <= selRange.maxR
  }, [selRange])

  const nameBoxVal = selEnd && (selEnd.col !== selCell.col || selEnd.row !== selCell.row)
    ? `${idxToCol(selRange.minC)}${selRange.minR}:${idxToCol(selRange.maxC)}${selRange.maxR}`
    : selRef

  const getData = useCallback((ref) => sheetData[ref]?.v || '', [sheetData])

  const getDisplay = useCallback((ref) => {
    const raw = getData(ref)
    if (!raw) return ''
    return fmtDisplay(evaluate(raw, getData))
  }, [getData])

  const setCell = useCallback((ref, patch) => {
    setAllData(prev => ({
      ...prev,
      [activeSheet]: {
        ...prev[activeSheet],
        [ref]: { ...(prev[activeSheet]?.[ref] || {}), ...patch }
      }
    }))
  }, [activeSheet])

  const commitEdit = useCallback(() => {
    if (editRef) setCell(editRef, { v: editVal })
    setEditCell(null)
    setEditVal('')
  }, [editRef, editVal, setCell])

  const cancelEdit = useCallback(() => {
    setEditCell(null)
    setEditVal('')
  }, [])

  const beginEdit = useCallback((ref, initial = null) => {
    const parsed = parseCellRef(ref)
    if (!parsed) return
    setEditCell(parsed)
    setEditVal(initial !== null ? initial : (sheetData[ref]?.v || ''))
  }, [sheetData])

  const move = useCallback((dc, dr) => {
    setSelCell(prev => ({
      col: idxToCol(Math.max(0, Math.min(NUM_COLS - 1, colIdx(prev.col) + dc))),
      row: Math.max(1, Math.min(NUM_ROWS, prev.row + dr)),
    }))
  }, [])

  const goTo = useCallback((col, row) => {
    setSelCell({ col, row })
    setSelEnd(null)
    setEditCell(null)
  }, [])

  const extendSel = useCallback((dc, dr) => {
    setSelEnd(prev => {
      const base = prev || selCell
      return {
        col: idxToCol(Math.max(0, Math.min(NUM_COLS - 1, colIdx(base.col) + dc))),
        row: Math.max(1, Math.min(NUM_ROWS, base.row + dr)),
      }
    })
  }, [selCell])

  useEffect(() => {
    if (editCell && editInputRef.current) {
      const inp = editInputRef.current
      inp.focus()
      inp.setSelectionRange(inp.value.length, inp.value.length)
    }
  }, [editCell])

  useEffect(() => { containerRef.current?.focus() }, [])

  useEffect(() => {
    const onMouseUp = () => { isDragging.current = false }
    document.addEventListener('mouseup', onMouseUp)
    return () => document.removeEventListener('mouseup', onMouseUp)
  }, [])

  // Formatting shortcuts require reading current selRef and selCellData at call time
  const toggleBold   = () => setCell(selRef, { bold: !selCellData.bold })
  const toggleItalic = () => setCell(selRef, { italic: !selCellData.italic })
  const setAlign     = (a) => setCell(selRef, { align: a })

  const handleKeyDown = (e) => {
    const meta = e.ctrlKey || e.metaKey
    if (editCell) return

    if (meta && e.key === 'b') { e.preventDefault(); toggleBold(); return }
    if (meta && e.key === 'i') { e.preventDefault(); toggleItalic(); return }
    if (meta && e.key === 'c') {
      navigator.clipboard?.writeText(getDisplay(selRef)).catch(() => {})
      return
    }

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        if (e.shiftKey) extendSel(0, -1); else { setSelEnd(null); move(0, -1) }
        break
      case 'ArrowDown':
        e.preventDefault()
        if (e.shiftKey) extendSel(0, 1); else { setSelEnd(null); move(0, 1) }
        break
      case 'ArrowLeft':
        e.preventDefault()
        if (e.shiftKey) extendSel(-1, 0); else { setSelEnd(null); move(-1, 0) }
        break
      case 'ArrowRight':
        e.preventDefault()
        if (e.shiftKey) extendSel(1, 0); else { setSelEnd(null); move(1, 0) }
        break
      case 'Tab':        e.preventDefault(); setSelEnd(null); move(e.shiftKey ? -1 : 1, 0); break
      case 'Enter':      e.preventDefault(); setSelEnd(null); beginEdit(selRef); break
      case 'F2':         e.preventDefault(); setSelEnd(null); beginEdit(selRef); break
      case 'Delete':
      case 'Backspace':  e.preventDefault(); setCell(selRef, { v: '' }); break
      default:
        if (e.key.length === 1 && !meta) { e.preventDefault(); setSelEnd(null); beginEdit(selRef, e.key) }
    }
  }

  const handleCellKeyDown = (e) => {
    if (e.key === 'Enter')  { e.preventDefault(); commitEdit(); move(0, 1);  containerRef.current?.focus() }
    if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); containerRef.current?.focus() }
    if (e.key === 'Tab')    { e.preventDefault(); commitEdit(); move(e.shiftKey ? -1 : 1, 0); containerRef.current?.focus() }
  }

  const fbarVal = editCell ? editVal : (sheetData[selRef]?.v || '')

  const handleFbarChange = (e) => {
    if (editCell) setEditVal(e.target.value)
    else beginEdit(selRef, e.target.value)
  }

  const handleFbarKeyDown = (e) => {
    if (e.key === 'Enter')  { e.preventDefault(); commitEdit(); containerRef.current?.focus() }
    if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); containerRef.current?.focus() }
  }

  const addSheet = () => {
    let i = sheets.length + 1
    let name = `Sheet${i}`
    while (sheets.includes(name)) { i++; name = `Sheet${i}` }
    setSheets(p => [...p, name])
    setAllData(p => ({ ...p, [name]: {} }))
    setActiveSheet(name)
  }

  const switchSheet = (name) => {
    if (editCell) commitEdit()
    setActiveSheet(name)
    setSelCell({ col: 'A', row: 1 })
    setEditCell(null)
    containerRef.current?.focus()
  }

  // Status bar: show sum/avg when selected cell has a value
  const statusVal = selCellData.v
    ? selCellData.v.startsWith('=')
      ? `= ${fmtDisplay(evaluate(selCellData.v, getData))}`
      : selCellData.v
    : ''

  return (
    <div className="xls-root">
      {/* Title bar */}
      <div className="xls-titlebar">
        <ExcelIcon />
        <span className="xls-appname">Spreadsheet</span>
        <span className="xls-filename">Book1</span>
      </div>

      {/* Ribbon */}
      <div className="xls-ribbon">
        <div className="xls-ribbon-group">
          <select className="xls-select xls-font-name">
            <option>Calibri</option><option>Arial</option>
            <option>Times New Roman</option><option>Courier New</option>
          </select>
          <select className="xls-select xls-font-size">
            {[8,9,10,11,12,14,16,18,20,24].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="xls-ribbon-sep" />

        <div className="xls-ribbon-group">
          <button className={`xls-btn bold-btn${selCellData.bold ? ' active' : ''}`} onClick={toggleBold} title="Bold (Ctrl+B)">B</button>
          <button className={`xls-btn italic-btn${selCellData.italic ? ' active' : ''}`} onClick={toggleItalic} title="Italic (Ctrl+I)">I</button>
          <button className="xls-btn underline-btn" title="Underline">U</button>
        </div>

        <div className="xls-ribbon-sep" />

        <div className="xls-ribbon-group">
          <button className={`xls-btn${selCellData.align === 'left' ? ' active' : ''}`} onClick={() => setAlign('left')} title="Align Left"><AlignLeftSVG /></button>
          <button className={`xls-btn${selCellData.align === 'center' ? ' active' : ''}`} onClick={() => setAlign('center')} title="Center"><AlignCenterSVG /></button>
          <button className={`xls-btn${selCellData.align === 'right' ? ' active' : ''}`} onClick={() => setAlign('right')} title="Align Right"><AlignRightSVG /></button>
        </div>

        <div className="xls-ribbon-sep" />

        <div className="xls-ribbon-group">
          <select className="xls-select">
            <option>General</option><option>Number</option>
            <option>Currency</option><option>Percentage</option><option>Date</option>
          </select>
        </div>
      </div>

      {/* Formula bar */}
      <div className="xls-fbar">
        <div className="xls-namebox">{nameBoxVal}</div>
        <div className="xls-fx">fx</div>
        <input
          ref={formulaBarRef}
          className="xls-fbar-input"
          value={fbarVal}
          onChange={handleFbarChange}
          onKeyDown={handleFbarKeyDown}
          onFocus={() => { if (!editCell) beginEdit(selRef, sheetData[selRef]?.v || '') }}
          spellCheck={false}
        />
      </div>

      {/* Grid */}
      <div
        ref={containerRef}
        className="xls-grid-wrap"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseMove={(e) => {
          if (!isDragging.current) return
          const td = e.target.closest('td[data-ref]')
          if (td) {
            const parsed = parseCellRef(td.dataset.ref)
            if (parsed) {
              setSelEnd(prev => {
                if (prev && prev.col === parsed.col && prev.row === parsed.row) return prev
                return parsed
              })
            }
          }
        }}
      >
        <table className="xls-grid">
          <colgroup>
            <col className="xls-colgroup-hdr" />
            {COLS.map(col => <col key={col} className="xls-colgroup-data" />)}
          </colgroup>
          <thead>
            <tr className="xls-grid-row">
              <th className="xls-hdr xls-corner" />
              {COLS.map(col => (
                <th key={col} className={`xls-hdr xls-col-hdr${inSel(col, selRange.minR) ? ' active' : ''}`}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: NUM_ROWS }, (_, i) => {
              const row = i + 1
              return (
                <tr key={row} className="xls-grid-row">
                  <td className={`xls-hdr xls-row-hdr${row >= selRange.minR && row <= selRange.maxR ? ' active' : ''}`}>{row}</td>
                  {COLS.map(col => {
                    const ref = `${col}${row}`
                    const isSel = selRef === ref
                    const isEditing = editRef === ref
                    const cell = sheetData[ref] || {}
                    const raw = cell.v || ''
                    const displayVal = getDisplay(ref)
                    const isNum = raw
                      ? raw.startsWith('=')
                        ? typeof evaluate(raw, getData) === 'number'
                        : !isNaN(parseFloat(raw)) && raw.trim() !== ''
                      : false
                    const align = cell.align || (isNum ? 'right' : 'left')

                    return (
                      <td
                        key={ref}
                        data-ref={ref}
                        className={`xls-cell${inSel(col, row) ? ' sel' : ''}${isSel ? ' sel-anchor' : ''}`}
                        onMouseDown={(e) => { e.preventDefault(); isDragging.current = true; if (editCell) commitEdit(); goTo(col, row); containerRef.current?.focus() }}
                        onDoubleClick={() => { goTo(col, row); beginEdit(ref) }}
                      >
                        {isEditing ? (
                          <input
                            ref={editInputRef}
                            className="xls-edit-input"
                            value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            onKeyDown={handleCellKeyDown}
                            spellCheck={false}
                          />
                        ) : (
                          <div className={['xls-cell-text', `xls-align-${align}`, cell.bold && 'xls-bold', cell.italic && 'xls-italic', cell.underline && 'xls-underline'].filter(Boolean).join(' ')}>
                            {displayVal}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Sheet tabs + status bar */}
      <div className="xls-statusbar">
        <button className="xls-tab-add" onClick={addSheet} title="New sheet">+</button>
        <div className="xls-tab-list">
          {sheets.map(name => (
            <button
              key={name}
              className={`xls-tab${activeSheet === name ? ' active' : ''}`}
              onClick={() => switchSheet(name)}
            >{name}</button>
          ))}
        </div>
        <div className="xls-status-right">{statusVal}</div>
      </div>
    </div>
  )
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function ExcelIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect width="18" height="18" rx="2" fill="#1D6638" />
      <path d="M4.5 4.5h4L10 8.5 11.5 4.5H13.5l-2.8 4.5 2.8 4.5H11.5L10 9.5 8.5 13.5H6.5L9.3 9 6.5 4.5z" fill="white" />
    </svg>
  )
}
function AlignLeftSVG() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="2" width="12" height="1.5"/><rect x="1" y="5.5" width="7" height="1.5"/><rect x="1" y="9" width="12" height="1.5"/><rect x="1" y="12.5" width="7" height="1.5"/></svg>
}
function AlignCenterSVG() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="2" width="12" height="1.5"/><rect x="3.5" y="5.5" width="7" height="1.5"/><rect x="1" y="9" width="12" height="1.5"/><rect x="3.5" y="12.5" width="7" height="1.5"/></svg>
}
function AlignRightSVG() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="2" width="12" height="1.5"/><rect x="6" y="5.5" width="7" height="1.5"/><rect x="1" y="9" width="12" height="1.5"/><rect x="6" y="12.5" width="7" height="1.5"/></svg>
}
