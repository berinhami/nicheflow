import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Eye } from 'lucide-react'
import type { Training, SceneElement } from '../../types'

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

interface Props {
  training: Training
  initialSceneId: string
  onExit: () => void
}

export default function PreviewMode({ training, initialSceneId, onExit }: Props) {
  const [currentSceneId, setCurrentSceneId] = useState(initialSceneId)
  const [swaps, setSwaps] = useState<Record<string, string>>({})
  const [popup, setPopup] = useState<string | null>(null)
  const [keypadPos, setKeypadPos] = useState<Record<string, { x: number; y: number }>>({})
  const [draggablePos, setDraggablePos] = useState<Record<string, { x: number; y: number }>>({})
  const [isDragging, setIsDragging] = useState(false)
  const dragSourceRef = useRef<string | null>(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  const scene = training.scenes.find((s) => s.id === currentSceneId) ?? training.scenes[0]
  const allElements = scene?.elements ?? []
  const visibleElements = allElements.filter((el) => !el.offstage)

  // Reset per-scene state when scene changes
  useEffect(() => {
    setSwaps({})
    setPopup(null)
    setKeypadPos({})
    setDraggablePos({})
    setIsDragging(false)
  }, [currentSceneId])

  // Keypad arrow-key movement — continuous while key held
  useEffect(() => {
    const keypads = visibleElements.filter((el) => el.interactivity?.type === 'keypad')
    if (keypads.length === 0) return

    const STEP = 12
    const INTERVAL_MS = 16 // ~60fps
    let intervalId: ReturnType<typeof setInterval> | null = null
    let activeKey: string | null = null

    const move = (key: string) => {
      setKeypadPos((prev) => {
        const next = { ...prev }
        keypads.forEach((el) => {
          const cur = prev[el.id] ?? { x: el.x, y: el.y }
          let { x, y } = cur
          if (key === 'ArrowUp') y = Math.max(0, y - STEP)
          if (key === 'ArrowDown') y = Math.min(500 - el.height, y + STEP)
          if (key === 'ArrowLeft') x = Math.max(0, x - STEP)
          if (key === 'ArrowRight') x = Math.min(800 - el.width, x + STEP)
          next[el.id] = { x, y }

          // Check destination overlap
          const cfg = el.interactivity
          if (cfg?.destinationElementId) {
            const dest = allElements.find((d) => d.id === cfg.destinationElementId)
            if (dest) {
              const overlap =
                x < dest.x + dest.width && x + el.width > dest.x &&
                y < dest.y + dest.height && y + el.height > dest.y
              if (overlap) {
                if (cfg.outcome === 'navigate' && cfg.targetSceneId) {
                  setTimeout(() => setCurrentSceneId(cfg.targetSceneId!), 0)
                } else if (cfg.outcome === 'open-popup' && cfg.popupContent) {
                  setTimeout(() => setPopup(cfg.popupContent!), 0)
                }
              }
            }
          }
        })
        return next
      })
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return
      e.preventDefault()
      if (activeKey === e.key) return // already running for this key
      activeKey = e.key
      move(e.key)
      intervalId = setInterval(() => move(activeKey!), INTERVAL_MS)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key !== activeKey) return
      activeKey = null
      if (intervalId !== null) { clearInterval(intervalId); intervalId = null }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (intervalId !== null) clearInterval(intervalId)
    }
  }, [visibleElements, allElements])

  const triggerOutcome = useCallback((el: SceneElement) => {
    const cfg = el.interactivity
    if (!cfg) return
    if (cfg.outcome === 'navigate' && cfg.targetSceneId) setCurrentSceneId(cfg.targetSceneId)
    else if (cfg.outcome === 'open-link' && cfg.targetUrl) window.open(cfg.targetUrl, '_blank', 'noopener')
    else if (cfg.outcome === 'open-popup' && cfg.popupContent) setPopup(cfg.popupContent)
    else if (cfg.outcome === 'swap' && cfg.swapElementId) setSwaps((p) => ({ ...p, [el.id]: cfg.swapElementId! }))
  }, [])

  const renderElement = (el: SceneElement) => {
    const swapTargetId = swaps[el.id]
    const display = swapTargetId ? (allElements.find((e) => e.id === swapTargetId) ?? el) : el
    const pos = keypadPos[el.id] ?? draggablePos[el.id] ?? { x: el.x, y: el.y }
    const cfg = el.interactivity
    const color = TYPE_COLORS[display.type] || '#7c3aed'
    const bg = TYPE_BG[display.type] || '#f5f3ff'

    let cursor = 'default'
    if (cfg?.type === 'button') cursor = 'pointer'
    if (cfg?.type === 'hoverable') cursor = 'pointer'
    if (cfg?.type === 'draggable') cursor = 'grab'

    const isDropzone = cfg?.type === 'dropzone'

    return (
      <div
        key={el.id}
        draggable={cfg?.type === 'draggable'}
        style={{
          position: 'absolute',
          left: pos.x, top: pos.y,
          width: el.width, height: el.height,
          zIndex: el.zIndex ?? 1,
          background: (display.type === 'header' || display.type === 'text') ? 'transparent' : (display.style?.background || (display.src ? 'transparent' : bg)),
          borderRadius: display.style?.borderRadius || '10px',
          opacity: display.style?.opacity ? Number(display.style.opacity) / 100 : 1,
          border: isDropzone && isDragging ? `2px dashed ${color}60` : 'none',
          cursor,
          overflow: 'hidden',
          userSelect: 'none',
          transition: cfg?.type === 'keypad' ? 'left 0.05s, top 0.05s' : undefined,
        }}
        onClick={cfg?.type === 'button' ? () => triggerOutcome(el) : undefined}
        onMouseEnter={cfg?.type === 'hoverable' ? () => {
          if (cfg.outcome === 'swap' && cfg.swapElementId) setSwaps((p) => ({ ...p, [el.id]: cfg.swapElementId! }))
          else if (cfg.outcome === 'open-popup' && cfg.popupContent) setPopup(cfg.popupContent)
        } : undefined}
        onMouseLeave={cfg?.type === 'hoverable' && cfg.outcome === 'swap' ? () => {
          setSwaps((p) => { const n = { ...p }; delete n[el.id]; return n })
        } : undefined}
        onDragStart={cfg?.type === 'draggable' ? (e) => {
          e.stopPropagation()
          dragSourceRef.current = el.id
          setIsDragging(true)
          const rect = (e.target as HTMLElement).getBoundingClientRect()
          dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
        } : undefined}
        onDragEnd={cfg?.type === 'draggable' ? () => {
          dragSourceRef.current = null
          setIsDragging(false)
        } : undefined}
        onDragOver={isDropzone ? (e) => e.preventDefault() : undefined}
        onDrop={isDropzone ? (e) => {
          e.preventDefault()
          const src = dragSourceRef.current
          if (!src) return
          const allowed = cfg.allowedDraggableIds ?? []
          if (allowed.length > 0 && !allowed.includes(src)) return
          // Position the dragged element where it was dropped
          const canvasRect = canvasRef.current?.getBoundingClientRect()
          if (canvasRect) {
            const srcEl = visibleElements.find((v) => v.id === src)
            if (srcEl) {
              setDraggablePos((p) => ({
                ...p,
                [src]: {
                  x: Math.max(0, Math.min(e.clientX - canvasRect.left - dragOffsetRef.current.x, 800 - srcEl.width)),
                  y: Math.max(0, Math.min(e.clientY - canvasRect.top - dragOffsetRef.current.y, 500 - srcEl.height)),
                },
              }))
            }
          }
          if (cfg.outcome === 'navigate' && cfg.targetSceneId) setCurrentSceneId(cfg.targetSceneId)
          else if (cfg.outcome === 'open-popup' && cfg.popupContent) setPopup(cfg.popupContent)
          dragSourceRef.current = null
          setIsDragging(false)
        } : undefined}
      >
        {/* Content rendering */}
        {display.src && display.type === 'image' && (
          <img src={display.src} alt="" className="w-full h-full object-cover" draggable={false} />
        )}
        {display.src && display.type === 'video' && (
          <video src={display.src} className="w-full h-full object-cover" controls />
        )}
        {!display.src && (display.type === 'header' || display.type === 'text') && (
          <div
            className={`w-full h-full flex items-center justify-center px-3 break-words text-center ${display.type === 'header' ? 'text-xl font-bold' : 'text-sm font-medium'}`}
            style={{ color }}
          >
            {display.content || display.type}
          </div>
        )}
        {!display.src && display.type !== 'header' && display.type !== 'text' && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
            <span className="text-xs font-semibold capitalize" style={{ color }}>{display.type}</span>
          </div>
        )}


      </div>
    )
  }

  const sceneIndex = training.scenes.findIndex((s) => s.id === currentSceneId)

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'rgba(15, 10, 30, 0.88)', backdropFilter: 'blur(6px)' }}
    >
      {/* Preview header */}
      <div className="flex items-center justify-between w-full px-8 pb-5" style={{ maxWidth: 900 }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl">
            <Eye size={13} className="text-violet-300" />
            <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Preview</span>
          </div>
          <span className="text-white/50 text-sm">{training.name}</span>
          <span className="text-white/30 text-sm">/</span>
          <span className="text-white/80 text-sm font-semibold">{scene?.name}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Scene dots */}
          <div className="flex items-center gap-2">
            {training.scenes.map((s) => (
              <button
                key={s.id}
                onClick={() => setCurrentSceneId(s.id)}
                title={s.name}
                className="transition-all"
                style={{
                  width: s.id === currentSceneId ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: s.id === currentSceneId ? '#a78bfa' : 'rgba(255,255,255,0.25)',
                }}
              />
            ))}
          </div>

          {/* Prev / Next */}
          {sceneIndex > 0 && (
            <button
              onClick={() => setCurrentSceneId(training.scenes[sceneIndex - 1].id)}
              className="text-white/60 hover:text-white text-xs font-semibold px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              ← Prev
            </button>
          )}
          {sceneIndex < training.scenes.length - 1 && (
            <button
              onClick={() => setCurrentSceneId(training.scenes[sceneIndex + 1].id)}
              className="text-white/60 hover:text-white text-xs font-semibold px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              Next →
            </button>
          )}

          <button
            onClick={onExit}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
          >
            <X size={13} /> Exit Preview
          </button>
        </div>
      </div>

      {/* Scene canvas */}
      <div
        ref={canvasRef}
        className="relative flex-shrink-0"
        style={{
          width: 800, height: 500,
          background: scene?.backgroundColor || '#ffffff',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
        }}
      >
        {visibleElements.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#9896b0]">
            <p className="text-sm font-medium">This scene has no elements</p>
          </div>
        )}
        {visibleElements.slice().sort((a, b) => (a.zIndex ?? 1) - (b.zIndex ?? 1)).map(renderElement)}
      </div>

      {/* Popup overlay */}
      {popup && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center"
          style={{ zIndex: 60 }}
          onClick={() => setPopup(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-2xl relative"
            style={{ maxWidth: 360, width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPopup(null)}
              className="absolute top-3 right-3 text-[#9896b0] hover:text-[#1a1733] transition-colors"
            >
              <X size={16} />
            </button>
            <p className="text-sm text-[#1a1733] leading-relaxed pr-4">{popup}</p>
            <button
              onClick={() => setPopup(null)}
              className="mt-4 w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-semibold py-2 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Keypad hint */}
      {visibleElements.some((el) => el.interactivity?.type === 'keypad') && (
        <div className="mt-4 flex items-center gap-1.5 text-white/40 text-xs">
          <span className="bg-white/10 px-2 py-0.5 rounded-md font-mono">↑ ↓ ← →</span>
          <span>to move keypad elements</span>
        </div>
      )}
    </div>
  )
}
