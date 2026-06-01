import { useRef, useState, useCallback, useEffect } from 'react'
import { ArrowLeft, Plus, Palette, MousePointer, X, EyeOff, Eye } from 'lucide-react'
import { useStore } from '../../store'
import type { ElementType, SceneElement } from '../../types'
import ElementPalette from './ElementPalette'
import CanvasElement from './CanvasElement'
import PropertiesPanel from './PropertiesPanel'
import InteractivityPanel from './InteractivityPanel'
import PreviewMode from './PreviewMode'

const uid = () => Math.random().toString(36).slice(2, 10)

const DEFAULT_SIZES: Record<ElementType, { width: number; height: number }> = {
  header: { width: 300, height: 60 }, text: { width: 280, height: 100 },
  quiz: { width: 320, height: 200 }, survey: { width: 300, height: 180 },
  video: { width: 320, height: 200 }, audio: { width: 240, height: 80 },
  image: { width: 200, height: 150 }, flashcard: { width: 240, height: 160 },
  shape: { width: 120, height: 120 }, animation: { width: 160, height: 160 },
  asset: { width: 160, height: 120 },
}

const OFFSTAGE_HEIGHT = 160

export default function SceneEditor() {
  const { trainings, activeTrainingId, activeSceneId, selectedElementId, setSelectedElement, setView, setActiveScene, addScene, updateScene, addElement, updateElement, deleteElement, updateNode } = useStore()

  const training = trainings.find((t) => t.id === activeTrainingId)
  const scene = training?.scenes.find((s) => s.id === activeSceneId) ?? training?.scenes[0]
  const selectedElement = scene?.elements.find((el) => el.id === selectedElementId) ?? null

  const [showPreview, setShowPreview] = useState(false)
  const [showInteractivity, setShowInteractivity] = useState(false)
  const [selectingDestination, setSelectingDestination] = useState(false)
  const [selectingSwapTarget, setSelectingSwapTarget] = useState(false)
  const [draggingType, setDraggingType] = useState<ElementType | null>(null)
  const [bgColor, setBgColor] = useState(scene?.backgroundColor || '#ffffff')
  const [showBgPicker, setShowBgPicker] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const offstageTopRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [canvasScale, setCanvasScale] = useState(1)
  const offstageBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollAreaRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const available = el.clientWidth - 64 // 32px padding each side
      setCanvasScale(Math.min(1, available / 800))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const makeDropHandler = useCallback((offstage?: 'top' | 'bottom') => (e: React.DragEvent) => {
    e.preventDefault()
    const type = (e.dataTransfer.getData('elementType') as ElementType) || draggingType
    if (!type || !activeTrainingId || !scene) return
    const ref = offstage === 'top' ? offstageTopRef : offstage === 'bottom' ? offstageBottomRef : canvasRef
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const el: SceneElement = {
      id: uid(), type,
      x: Math.max(0, e.clientX - rect.left - 60),
      y: Math.max(0, e.clientY - rect.top - 30),
      ...DEFAULT_SIZES[type],
      zIndex: (scene.elements.length + 1) * 10,
      ...(offstage ? { offstage } : {}),
    }
    addElement(activeTrainingId, scene.id, el)
    setSelectedElement(el.id)
    setDraggingType(null)
  }, [draggingType, activeTrainingId, scene, addElement, setSelectedElement])

  const handleUpdateElement = useCallback((updates: Partial<SceneElement>) => {
    if (!activeTrainingId || !scene || !selectedElementId || !training) return
    updateElement(activeTrainingId, scene.id, selectedElementId, updates)

    // Sync node connections when interactivity changes
    if ('interactivity' in updates) {
      const updatedElements = scene.elements.map((el) =>
        el.id === selectedElementId ? { ...el, ...updates } : el
      )
      const navigateTargetSceneIds = new Set(
        updatedElements
          .flatMap((el) => el.interactivity?.outcome === 'navigate' && el.interactivity?.targetSceneId ? [el.interactivity.targetSceneId] : [])
      )
      const currentNode = training.nodes.find((n) => n.sceneId === scene.id)
      if (currentNode) {
        const targetNodeIds = training.nodes
          .filter((n) => navigateTargetSceneIds.has(n.sceneId))
          .map((n) => n.id)
        updateNode(activeTrainingId, currentNode.id, { connections: targetNodeIds })
      }
    }
  }, [activeTrainingId, scene, selectedElementId, training, updateElement, updateNode])

  const handleDeleteElement = useCallback(() => {
    if (!activeTrainingId || !scene || !selectedElementId) return
    deleteElement(activeTrainingId, scene.id, selectedElementId)
    setSelectedElement(null)
    setShowInteractivity(false)
  }, [activeTrainingId, scene, selectedElementId, deleteElement, setSelectedElement])

  const handleBgChange = (color: string) => {
    setBgColor(color)
    if (activeTrainingId && scene) updateScene(activeTrainingId, scene.id, { backgroundColor: color })
  }

  const handleElementSelect = useCallback((el: SceneElement) => {
    if (selectingDestination) {
      handleUpdateElement({
        interactivity: { ...selectedElement!.interactivity!, destinationElementId: el.id },
      })
      setSelectingDestination(false)
    } else if (selectingSwapTarget) {
      handleUpdateElement({
        interactivity: { ...selectedElement!.interactivity!, swapElementId: el.id },
      })
      setSelectingSwapTarget(false)
    } else {
      setSelectedElement(el.id)
      setShowInteractivity(false)
    }
  }, [selectingDestination, selectingSwapTarget, selectedElement, handleUpdateElement, setSelectedElement])

  if (!training || !scene) return <div className="flex-1 flex items-center justify-center text-[#9896b0]">No scene selected</div>

  const isSelecting = selectingDestination || selectingSwapTarget
  const onstageElements = scene.elements.filter((el) => !el.offstage)
  const offstageTopElements = scene.elements.filter((el) => el.offstage === 'top')
  const offstageBottomElements = scene.elements.filter((el) => el.offstage === 'bottom')

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-[#e5e3f0]">
        <button onClick={() => setView('node-builder')} className="flex items-center gap-1.5 text-sm text-[#5c5880] hover:text-[#1a1733] font-medium transition-colors">
          <ArrowLeft size={16} /> Flow
        </button>
        <div className="w-px h-5 bg-[#e5e3f0]" />
        <span className="text-sm text-[#9896b0] font-medium">{training.name}</span>
        <span className="text-[#c4c0dc]">/</span>
        <span className="text-sm font-bold text-[#1a1733]">{scene.name}</span>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 text-sm bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-3 py-1.5 rounded-xl font-semibold transition-colors shadow-sm"
          >
            <Eye size={15} /> Preview
          </button>
          <div className="relative">
            <button
              onClick={() => setShowBgPicker((v) => !v)}
              className="flex items-center gap-2 text-sm text-[#5c5880] hover:text-[#1a1733] bg-[#f8f7ff] hover:bg-[#f1f0f7] border border-[#e5e3f0] px-3 py-1.5 rounded-xl transition-colors font-medium"
            >
              <Palette size={15} />
              <span className="w-4 h-4 rounded-md border border-[#e5e3f0]" style={{ background: bgColor }} />
              Background
            </button>
            {showBgPicker && (
              <div className="absolute right-0 top-11 bg-white border border-[#e5e3f0] rounded-2xl p-4 z-50 shadow-xl">
                <p className="text-xs font-semibold text-[#9896b0] uppercase tracking-wider mb-3">Canvas Background</p>
                <input type="color" value={bgColor} onChange={(e) => handleBgChange(e.target.value)} className="w-36 h-9 cursor-pointer rounded-lg border border-[#e5e3f0]" />
                <div className="flex gap-2 mt-3 flex-wrap">
                  {['#ffffff', '#f8f7ff', '#f1f0f7', '#1e293b', '#0f172a', '#1a1733'].map((c) => (
                    <button key={c} onClick={() => handleBgChange(c)} className="w-6 h-6 rounded-lg border-2 border-[#e5e3f0] hover:scale-110 transition-transform" style={{ background: c }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <ElementPalette onDragStart={(type) => setDraggingType(type)} />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Scene tabs */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white border-b border-[#e5e3f0] overflow-x-auto scrollbar-thin">
            {training.scenes.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveScene(s.id)}
                className={`flex-shrink-0 text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                  s.id === scene.id
                    ? 'bg-[#7c3aed] text-white shadow-sm'
                    : 'text-[#5c5880] hover:text-[#1a1733] hover:bg-[#f1f0f7]'
                }`}
              >
                {s.name}
              </button>
            ))}
            <button
              onClick={() => { if (!activeTrainingId) return; addScene(activeTrainingId, { name: `Scene ${training.scenes.length + 1}`, backgroundColor: '#ffffff', elements: [] }) }}
              className="flex-shrink-0 flex items-center gap-1 text-xs px-2.5 py-1.5 text-[#9896b0] hover:text-[#7c3aed] hover:bg-[#f5f3ff] rounded-lg transition-colors font-semibold"
            >
              <Plus size={12} /> Add
            </button>
          </div>

          {/* Selection banners */}
          {selectingDestination && (
            <div className="flex items-center justify-between gap-3 px-5 py-3 bg-[#7c3aed] text-white text-sm font-medium">
              <div className="flex items-center gap-2">
                <MousePointer size={16} className="flex-shrink-0 animate-bounce" />
                Please select an element to designate your desired destination.
              </div>
              <button onClick={() => setSelectingDestination(false)} className="flex-shrink-0 text-white/70 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
          )}
          {selectingSwapTarget && (
            <div className="flex items-center justify-between gap-3 px-5 py-3 bg-[#7c3aed] text-white text-sm font-medium">
              <div className="flex items-center gap-2">
                <MousePointer size={16} className="flex-shrink-0 animate-bounce" />
                Please select an element to swap to.
              </div>
              <button onClick={() => setSelectingSwapTarget(false)} className="flex-shrink-0 text-white/70 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Canvas area with offstage strips */}
          <div ref={scrollAreaRef} className="flex-1 overflow-auto scrollbar-thin flex justify-center p-8" style={{ background: '#f1f0f7' }}>
            {/* Outer div collapses to scaled size so no excess scroll */}
            <div style={{ width: 800 * canvasScale, height: (OFFSTAGE_HEIGHT * 2 + 500) * canvasScale, flexShrink: 0 }}>
              <div style={{ width: 800, transformOrigin: 'top left', transform: `scale(${canvasScale})` }}>
            <div className="flex flex-col gap-0" style={{ width: 800 }}>

              {/* Offstage top strip */}
              <OffstageStrip
                label="Hidden Stage — Top"
                stripRef={offstageTopRef}
                elements={offstageTopElements}
                height={OFFSTAGE_HEIGHT}
                position="top"
                selectedElementId={selectedElementId}
                isSelecting={isSelecting}
                onDrop={makeDropHandler('top')}
                onElementSelect={handleElementSelect}
                onElementChange={(id, updates) => { if (activeTrainingId) updateElement(activeTrainingId, scene.id, id, updates) }}
                canvasRef={offstageTopRef}
                onBgClick={() => { if (!isSelecting) { setSelectedElement(null); setShowInteractivity(false) } }}
              />

              {/* Main scene canvas */}
              <div
                ref={canvasRef}
                className="relative flex-shrink-0"
                style={{
                  width: 800, height: 500,
                  background: bgColor,
                  border: isSelecting ? '2px solid #7c3aed' : '1px solid #e5e3f0',
                  boxShadow: isSelecting ? '0 0 0 4px #ddd6fe' : '0 8px 32px rgba(0,0,0,0.10)',
                  cursor: isSelecting ? 'crosshair' : 'default',
                  zIndex: 1,
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={makeDropHandler(undefined)}
                onMouseDown={(e) => {
                  if (e.target === canvasRef.current) {
                    if (!isSelecting) { setSelectedElement(null); setShowInteractivity(false) }
                  }
                }}
              >
                {onstageElements.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#f5f3ff] flex items-center justify-center">
                      <Plus size={22} className="text-[#a78bfa]" />
                    </div>
                    <p className="text-sm font-medium text-[#9896b0]">Drag elements from the panel</p>
                  </div>
                )}
                {onstageElements.slice().sort((a, b) => (a.zIndex ?? 1) - (b.zIndex ?? 1)).map((el) => (
                  <CanvasElement
                    key={el.id}
                    element={el}
                    selected={el.id === selectedElementId}
                    selectingDestination={isSelecting}
                    onSelect={() => handleElementSelect(el)}
                    onChange={(updates) => { if (activeTrainingId) updateElement(activeTrainingId, scene.id, el.id, updates) }}
                    canvasRef={canvasRef} />
                ))}
              </div>

              {/* Offstage bottom strip */}
              <OffstageStrip
                label="Hidden Stage — Bottom"
                stripRef={offstageBottomRef}
                elements={offstageBottomElements}
                height={OFFSTAGE_HEIGHT}
                position="bottom"
                selectedElementId={selectedElementId}
                isSelecting={isSelecting}
                onDrop={makeDropHandler('bottom')}
                onElementSelect={handleElementSelect}
                onElementChange={(id, updates) => { if (activeTrainingId) updateElement(activeTrainingId, scene.id, id, updates) }}
                canvasRef={offstageBottomRef}
                onBgClick={() => { if (!isSelecting) { setSelectedElement(null); setShowInteractivity(false) } }}
              />

            </div>
              </div>
            </div>
          </div>
        </div>

        {selectedElement && !showInteractivity && (
          <PropertiesPanel element={selectedElement} onChange={handleUpdateElement} onDelete={handleDeleteElement}
            onToggleInteractivity={() => setShowInteractivity(true)}
            onBringForward={() => handleUpdateElement({ zIndex: (selectedElement.zIndex ?? 10) + 10 })}
            onSendBackward={() => handleUpdateElement({ zIndex: Math.max(1, (selectedElement.zIndex ?? 10) - 10) })} />
        )}
        {selectedElement && showInteractivity && (
          <InteractivityPanel
            element={selectedElement}
            scenes={training.scenes}
            currentSceneId={scene.id}
            currentSceneElements={scene.elements}
            selectingDestination={selectingDestination}
            onStartSelectDestination={() => setSelectingDestination(true)}
            selectingSwapTarget={selectingSwapTarget}
            onStartSelectSwapTarget={() => setSelectingSwapTarget(true)}
            onChange={(config) => handleUpdateElement({ interactivity: config })}
            onClose={() => { setShowInteractivity(false); setSelectingDestination(false); setSelectingSwapTarget(false) }} />
        )}
      </div>

      {showPreview && (
        <PreviewMode
          training={training}
          initialSceneId={scene.id}
          onExit={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}

function OffstageStrip({
  label, stripRef, elements, height, position, selectedElementId, isSelecting,
  onDrop, onElementSelect, onElementChange, canvasRef, onBgClick,
}: {
  label: string
  stripRef: React.RefObject<HTMLDivElement | null>
  elements: SceneElement[]
  height: number
  position: 'top' | 'bottom'
  selectedElementId: string | null
  isSelecting: boolean
  onDrop: (e: React.DragEvent) => void
  onElementSelect: (el: SceneElement) => void
  onElementChange: (id: string, updates: Partial<SceneElement>) => void
  canvasRef: React.RefObject<HTMLDivElement | null>
  onBgClick: () => void
}) {
  return (
    <div
      ref={stripRef}
      className="relative flex-shrink-0"
      style={{
        width: 800,
        height,
        background: 'repeating-linear-gradient(45deg, #f1f0f7, #f1f0f7 8px, #ebe9f5 8px, #ebe9f5 16px)',
        border: isSelecting ? '2px dashed #7c3aed' : '1.5px dashed #c4c0dc',
        borderRadius: position === 'top' ? '16px 16px 0 0' : '0 0 16px 16px',
        cursor: isSelecting ? 'crosshair' : 'default',
        overflow: 'hidden',
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onMouseDown={(e) => { if (e.target === stripRef.current) onBgClick() }}
    >
      {/* Label */}
      <div className="absolute top-2 left-3 flex items-center gap-1.5 pointer-events-none select-none">
        <EyeOff size={11} className="text-[#9896b0]" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9896b0]">{label}</span>
      </div>

      {elements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-xs text-[#b8b5d0] font-medium">Drop hidden elements here</p>
        </div>
      )}

      {elements.slice().sort((a, b) => (a.zIndex ?? 1) - (b.zIndex ?? 1)).map((el) => (
        <CanvasElement
          key={el.id}
          element={el}
          selected={el.id === selectedElementId}
          selectingDestination={isSelecting}
          onSelect={() => onElementSelect(el)}
          onChange={(updates) => onElementChange(el.id, updates)}
          canvasRef={canvasRef}
          offstage
        />
      ))}
    </div>
  )
}
