import { useRef, useCallback, useState } from 'react'
import { Type, AlignLeft, HelpCircle, BarChart2, Film, Music, Image, Layers, Square, Sparkles, ImagePlus, Upload, Zap } from 'lucide-react'
import type { SceneElement } from '../../types'

const TYPE_COLORS: Record<string, string> = {
  header: '#7c3aed', text: '#2563eb', quiz: '#d97706', survey: '#059669',
  video: '#2563eb', audio: '#7c3aed', image: '#0891b2', flashcard: '#dc2626',
  shape: '#64748b', animation: '#d97706', asset: '#059669',
}
const TYPE_BG: Record<string, string> = {
  header: '#f5f3ff', text: '#eff6ff', quiz: '#fffbeb', survey: '#f0fdf4',
  video: '#eff6ff', audio: '#f5f3ff', image: '#ecfeff', flashcard: '#fef2f2',
  shape: '#f8fafc', animation: '#fffbeb', asset: '#f0fdf4',
}
const TYPE_ICONS: Record<string, React.ReactNode> = {
  header: <Type size={20} />, text: <AlignLeft size={20} />, quiz: <HelpCircle size={20} />,
  survey: <BarChart2 size={20} />, video: <Film size={20} />, audio: <Music size={20} />,
  image: <Image size={20} />, flashcard: <Layers size={20} />, shape: <Square size={20} />,
  animation: <Sparkles size={20} />, asset: <ImagePlus size={20} />,
}

interface Props {
  element: SceneElement
  selected: boolean
  selectingDestination?: boolean
  onSelect: () => void
  onChange: (updates: Partial<SceneElement>) => void
  canvasRef: React.RefObject<HTMLDivElement | null>
  offstage?: boolean
}

export default function CanvasElement({ element, selected, selectingDestination, onSelect, onChange, canvasRef, offstage }: Props) {
  const dragOffset = useRef({ x: 0, y: 0 })
  const resizing = useRef(false)
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [editing, setEditing] = useState(false)

  const isTextType = element.type === 'header' || element.type === 'text'

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (resizing.current || editing) return
    e.stopPropagation()
    onSelect()
    if (selectingDestination) return
    dragOffset.current = { x: e.clientX - element.x, y: e.clientY - element.y }

    const onMove = (me: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      onChange({
        x: Math.max(0, Math.min(me.clientX - dragOffset.current.x, rect.width - element.width)),
        y: Math.max(0, Math.min(me.clientY - dragOffset.current.y, rect.height - element.height)),
      })
    }
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [element, onSelect, onChange, canvasRef, editing])

  const handleResizeDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    resizing.current = true
    resizeStart.current = { x: e.clientX, y: e.clientY, w: element.width, h: element.height }

    const onMove = (me: MouseEvent) => {
      onChange({
        width: Math.max(60, resizeStart.current.w + me.clientX - resizeStart.current.x),
        height: Math.max(40, resizeStart.current.h + me.clientY - resizeStart.current.y),
      })
    }
    const onUp = () => { resizing.current = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [element, onChange])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (!isTextType || selectingDestination) return
    e.stopPropagation()
    setEditing(true)
    setTimeout(() => {
      textareaRef.current?.focus()
      textareaRef.current?.select()
    }, 0)
  }, [isTextType, selectingDestination])

  const commitEdit = useCallback(() => {
    setEditing(false)
  }, [])

  const needsUpload = ['video', 'audio', 'image'].includes(element.type)
  const color = TYPE_COLORS[element.type] || '#7c3aed'
  const bg = TYPE_BG[element.type] || '#f5f3ff'

  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'absolute',
        left: element.x, top: element.y,
        width: element.width, height: element.height,
        zIndex: element.zIndex ?? 1,
        opacity: offstage ? 0.65 : (element.style?.opacity ? Number(element.style.opacity) / 100 : 1),
        background: isTextType ? 'transparent' : (element.style?.background || (element.src ? 'transparent' : bg)),
        borderRadius: element.style?.borderRadius || '10px',
        border: selectingDestination
          ? `2px dashed ${color}`
          : isTextType
          ? (editing ? `2px dashed ${color}` : selected ? `1.5px dashed ${color}60` : 'none')
          : (selected ? `2px solid ${color}` : 'none'),
        cursor: selectingDestination ? 'crosshair' : editing ? 'text' : 'move',
        overflow: 'hidden',
        userSelect: editing ? 'text' : 'none',
        boxShadow: selectingDestination
          ? `0 0 0 0px transparent`
          : selected
          ? `0 0 0 3px ${color}20`
          : '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {/* Inline text editor for header/text types */}
      {isTextType && editing && (
        <textarea
          ref={textareaRef}
          value={element.content || ''}
          onChange={(e) => onChange({ content: e.target.value })}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (element.type === 'header' && e.key === 'Enter') { e.preventDefault(); commitEdit() }
            if (e.key === 'Escape') commitEdit()
            e.stopPropagation()
          }}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder={element.type === 'header' ? 'Heading text…' : 'Body text…'}
          style={{
            width: '100%', height: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            padding: '10px 12px',
            fontSize: element.type === 'header' ? '20px' : '14px',
            fontWeight: element.type === 'header' ? 700 : 500,
            color,
            fontFamily: 'inherit',
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        />
      )}

      {/* Static text display */}
      {isTextType && !editing && (
        <div
          className="w-full h-full flex items-center justify-center px-3"
          title="Double-click to edit"
        >
          {element.content ? (
            <span
              className={`text-center break-words w-full ${element.type === 'header' ? 'text-xl font-bold' : 'text-sm font-medium'}`}
              style={{ color, lineHeight: 1.4 }}
            >
              {element.content}
            </span>
          ) : (
            <span className="text-xs font-medium opacity-50" style={{ color }}>
              {element.type === 'header' ? 'Double-click to add heading' : 'Double-click to add text'}
            </span>
          )}
        </div>
      )}

      {/* Uploaded content */}
      {!isTextType && element.src && element.type === 'image' && <img src={element.src} alt="" className="w-full h-full object-cover" draggable={false} />}
      {!isTextType && element.src && element.type === 'video' && <video src={element.src} className="w-full h-full object-cover" />}
      {!isTextType && element.src && element.type === 'audio' && (
        <div className="w-full h-full flex items-center justify-center"><Music size={24} style={{ color }} /></div>
      )}

      {/* Upload prompt */}
      {!isTextType && !element.src && needsUpload && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          <div style={{ color }} className="opacity-70">{TYPE_ICONS[element.type]}</div>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold border transition-colors"
            style={{ borderColor: color + '40', color, background: bg }}
          >
            <Upload size={11} /> Upload {element.type}
          </button>
          <input ref={fileInputRef} type="file"
            accept={element.type === 'image' ? 'image/*' : element.type === 'video' ? 'video/*' : 'audio/*'}
            className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange({ src: URL.createObjectURL(f) }) }} />
        </div>
      )}

      {/* Non-text, non-upload default display */}
      {!isTextType && !element.src && !needsUpload && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 px-3">
          <div style={{ color }} className="opacity-70">{TYPE_ICONS[element.type]}</div>
          <span className="text-xs font-semibold capitalize" style={{ color: color + 'bb' }}>{element.type}</span>
        </div>
      )}

      {/* Interactivity badge */}
      {element.interactivity && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-md flex items-center justify-center shadow-sm"
          style={{ background: color, color: '#fff' }}
          title={`${element.interactivity.type}: ${element.interactivity.outcome || ''}`}>
          <Zap size={10} />
        </div>
      )}

      {/* Resize handle */}
      {selected && !editing && (
        <div onMouseDown={handleResizeDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize rounded-tl-md"
          style={{ background: color }} />
      )}
    </div>
  )
}
