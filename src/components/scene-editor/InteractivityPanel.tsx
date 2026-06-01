import { useState } from 'react'
import { X, Zap, Package, MousePointer, XCircle, MapPin } from 'lucide-react'
import type { SceneElement, InteractivityType, InteractivityConfig, Scene } from '../../types'
import SceneFlowPicker from './SceneFlowPicker'

interface Props {
  element: SceneElement
  scenes: Scene[]
  currentSceneId: string
  currentSceneElements: SceneElement[]
  selectingDestination: boolean
  onStartSelectDestination: () => void
  selectingSwapTarget: boolean
  onStartSelectSwapTarget: () => void
  onChange: (config: InteractivityConfig | undefined) => void
  onClose: () => void
}

const TYPES: { value: InteractivityType; label: string; desc: string }[] = [
  { value: null,       label: 'None',               desc: 'No interaction' },
  { value: 'button',   label: 'Button',              desc: 'Click triggers an action' },
  { value: 'hoverable',label: 'Hoverable',           desc: 'Hover triggers an action' },
  { value: 'draggable',label: 'Draggable',           desc: 'Learner can drag this element' },
  { value: 'dropzone', label: 'Drop Zone',           desc: 'Accepts draggable elements' },
  { value: 'keypad',   label: 'Keypad Controllable', desc: 'Move with arrow keys' },
]

export default function InteractivityPanel({ element, scenes, currentSceneId, currentSceneElements, selectingDestination, onStartSelectDestination, selectingSwapTarget, onStartSelectSwapTarget, onChange, onClose }: Props) {
  const config = element.interactivity || { type: null }

  const update = (updates: Partial<InteractivityConfig>) => {
    const next = { ...config, ...updates }
    onChange(next.type === null ? undefined : next)
  }

  return (
    <div className="w-72 bg-white border-l border-[#e5e3f0] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#e5e3f0]">
        <h3 className="text-sm font-bold text-[#1a1733] flex items-center gap-2">
          <Zap size={15} className="text-[#7c3aed]" /> Interactivity
        </h3>
        <button onClick={onClose} className="text-[#9896b0] hover:text-[#1a1733] transition-colors"><X size={16} /></button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#9896b0] uppercase tracking-wider mb-2.5">Element Type</label>
          <select
            value={String(config.type)}
            onChange={(e) => {
              const val = e.target.value === 'null' ? null : e.target.value
              onChange(val === null ? undefined : { type: val as InteractivityType })
            }}
            className="w-full bg-[#f8f7ff] border border-[#e5e3f0] rounded-xl px-3 py-2.5 text-sm text-[#1a1733] outline-none focus:border-[#7c3aed] font-medium cursor-pointer"
          >
            {TYPES.map(({ value, label }) => (
              <option key={String(value)} value={String(value)}>{label}</option>
            ))}
          </select>
        </div>

        {config.type === 'button' && (
          <OutcomeSection label="On Click Outcome" options={['navigate', 'open-link', 'open-popup', 'swap']} config={config} scenes={scenes} currentSceneId={currentSceneId} sceneElements={currentSceneElements} selectingSwapTarget={selectingSwapTarget} onStartSelectSwapTarget={onStartSelectSwapTarget} onChange={update} />
        )}
        {config.type === 'hoverable' && (
          <OutcomeSection label="On Hover Outcome" options={['open-popup', 'swap']} config={config} scenes={scenes} currentSceneId={currentSceneId} sceneElements={currentSceneElements} selectingSwapTarget={selectingSwapTarget} onStartSelectSwapTarget={onStartSelectSwapTarget} onChange={update} />
        )}
        {config.type === 'draggable' && (
          <div className="p-3 bg-[#f5f3ff] rounded-xl border border-[#ddd6fe]">
            <p className="text-xs text-[#5c5880] font-medium">This element can be dragged by the learner and dropped into designated Drop Zones.</p>
          </div>
        )}
        {config.type === 'dropzone' && (
          <div className="space-y-4">
            <AcceptedObjects
              currentElement={element}
              sceneElements={currentSceneElements}
              allowedIds={config.allowedDraggableIds || []}
              onChange={(ids) => update({ allowedDraggableIds: ids })}
            />
            <OutcomeSection label="On Correct Drop" options={['navigate', 'open-popup']} config={config} scenes={scenes} currentSceneId={currentSceneId} onChange={update} />
          </div>
        )}
        {config.type === 'keypad' && (
          <div className="space-y-4">
            <div className="p-3 bg-[#f5f3ff] rounded-xl border border-[#ddd6fe]">
              <p className="text-xs text-[#5c5880] font-medium">Learner moves this element with arrow keys. Set a destination element to trigger an outcome when reached.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#9896b0] uppercase tracking-wider mb-2.5">Destination</label>
              {(() => {
                const destEl = config.destinationElementId
                  ? currentSceneElements.find(el => el.id === config.destinationElementId)
                  : null

                if (destEl) {
                  const color = TYPE_COLORS[destEl.type] || '#7c3aed'
                  const bg = TYPE_BG[destEl.type] || '#f5f3ff'
                  return (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl border border-[#7c3aed] bg-[#f5f3ff]">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-[#e5e3f0]"
                        style={{ background: destEl.src ? 'transparent' : bg }}
                      >
                        {destEl.src && (destEl.type === 'image' || destEl.type === 'asset') ? (
                          <img src={destEl.src} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-[10px] font-bold uppercase" style={{ color }}>
                            {destEl.type.slice(0, 3)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1a1733] truncate capitalize">{destEl.content || destEl.type}</p>
                        <p className="text-[10px] text-[#9896b0] capitalize">{destEl.type}</p>
                      </div>
                      <button
                        onClick={() => update({ destinationElementId: undefined })}
                        className="flex-shrink-0 text-[#9896b0] hover:text-red-500 transition-colors"
                        title="Remove destination"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  )
                }

                return (
                  <button
                    onClick={onStartSelectDestination}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 border-dashed text-sm font-semibold transition-all ${
                      selectingDestination
                        ? 'border-[#7c3aed] bg-[#f5f3ff] text-[#7c3aed] animate-pulse'
                        : 'border-[#c4c0dc] text-[#5c5880] hover:border-[#7c3aed] hover:text-[#7c3aed] hover:bg-[#f5f3ff]'
                    }`}
                  >
                    <MousePointer size={15} />
                    {selectingDestination ? 'Selecting…' : 'Select a destination'}
                  </button>
                )
              })()}
            </div>

            <OutcomeSection label="On Reach Destination" options={['navigate', 'open-popup']} config={config} scenes={scenes} currentSceneId={currentSceneId} onChange={update} />
          </div>
        )}
      </div>
    </div>
  )
}

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

function AcceptedObjects({ currentElement, sceneElements, allowedIds, onChange }: {
  currentElement: SceneElement
  sceneElements: SceneElement[]
  allowedIds: string[]
  onChange: (ids: string[]) => void
}) {
  const draggables = sceneElements.filter(
    (el) => el.id !== currentElement.id && el.interactivity?.type === 'draggable'
  )

  const toggle = (id: string) => {
    onChange(
      allowedIds.includes(id) ? allowedIds.filter((x) => x !== id) : [...allowedIds, id]
    )
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-[#9896b0] uppercase tracking-wider mb-2.5">
        Accepted Objects
      </label>
      {draggables.length === 0 ? (
        <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <Package size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            There are currently no existing draggable objects in this scene. Please select an object and assign it the <strong>Draggable</strong> type to enable drop zone acceptance.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {draggables.map((el) => {
            const checked = allowedIds.includes(el.id)
            const color = TYPE_COLORS[el.type] || '#7c3aed'
            const bg = TYPE_BG[el.type] || '#f5f3ff'
            return (
              <label
                key={el.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  checked
                    ? 'border-[#7c3aed] bg-[#f5f3ff]'
                    : 'border-[#e5e3f0] bg-white hover:border-[#a78bfa] hover:bg-[#fafafe]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(el.id)}
                  className="w-4 h-4 rounded accent-[#7c3aed] flex-shrink-0"
                />
                {/* Thumbnail */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-[#e5e3f0]"
                  style={{ background: el.src ? 'transparent' : bg }}
                >
                  {el.src && (el.type === 'image' || el.type === 'asset') ? (
                    <img src={el.src} alt="" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-[10px] font-bold uppercase" style={{ color }}>
                      {el.type.slice(0, 3)}
                    </span>
                  )}
                </div>
                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1a1733] truncate capitalize">
                    {el.content || el.type}
                  </p>
                  <p className="text-[10px] text-[#9896b0] capitalize">{el.type}</p>
                </div>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

function OutcomeSection({ label, options, config, scenes, currentSceneId, sceneElements, selectingSwapTarget, onStartSelectSwapTarget, onChange }: {
  label: string; options: string[]; config: InteractivityConfig; scenes: Scene[]
  currentSceneId?: string
  sceneElements?: SceneElement[]
  selectingSwapTarget?: boolean
  onStartSelectSwapTarget?: () => void
  onChange: (updates: Partial<InteractivityConfig>) => void
}) {
  const [showFlowPicker, setShowFlowPicker] = useState(false)
  const labels: Record<string, string> = { navigate: 'Navigate To', 'open-link': 'Open Link', 'open-popup': 'Open Popup', swap: 'Swap To' }
  const targetScene = config.targetSceneId ? scenes.find((s) => s.id === config.targetSceneId) : null

  return (
    <div className="space-y-2.5">
      <label className="block text-xs font-semibold text-[#9896b0] uppercase tracking-wider">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button key={opt}
            onClick={() => onChange({ outcome: opt as InteractivityConfig['outcome'] })}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-all ${
              config.outcome === opt
                ? 'bg-[#7c3aed] text-white border-[#7c3aed]'
                : 'bg-[#f8f7ff] text-[#5c5880] border-[#e5e3f0] hover:border-[#a78bfa] hover:text-[#7c3aed]'
            }`}
          >
            {labels[opt] || opt}
          </button>
        ))}
      </div>

      {config.outcome === 'navigate' && (
        <div>
          {targetScene ? (
            <div className="flex items-center gap-2 p-2.5 rounded-xl border border-[#7c3aed] bg-[#f5f3ff]">
              <MapPin size={13} className="text-[#7c3aed] flex-shrink-0" />
              <span className="text-xs font-semibold text-[#1a1733] flex-1 truncate">{targetScene.name}</span>
              <button
                onClick={() => setShowFlowPicker(true)}
                className="text-[10px] font-semibold text-[#7c3aed] hover:underline flex-shrink-0"
              >
                Change
              </button>
              <button
                onClick={() => onChange({ targetSceneId: undefined })}
                className="flex-shrink-0 text-[#9896b0] hover:text-red-500 transition-colors"
              >
                <XCircle size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowFlowPicker(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 border-dashed border-[#c4c0dc] text-sm font-semibold text-[#5c5880] hover:border-[#7c3aed] hover:text-[#7c3aed] hover:bg-[#f5f3ff] transition-all"
            >
              <MapPin size={15} />
              Select destination scene
            </button>
          )}
          {showFlowPicker && currentSceneId && (
            <SceneFlowPicker
              scenes={scenes}
              currentSceneId={currentSceneId}
              targetSceneId={config.targetSceneId}
              onSelect={(sceneId) => { onChange({ targetSceneId: sceneId }); setShowFlowPicker(false) }}
              onClose={() => setShowFlowPicker(false)}
            />
          )}
        </div>
      )}
      {config.outcome === 'open-link' && (
        <input type="url" value={config.targetUrl || ''} onChange={(e) => onChange({ targetUrl: e.target.value })}
          placeholder="https://..."
          className="w-full bg-[#f8f7ff] border border-[#e5e3f0] rounded-xl px-3 py-2 text-xs text-[#1a1733] outline-none focus:border-[#7c3aed] placeholder-[#9896b0]" />
      )}
      {config.outcome === 'open-popup' && (
        <textarea value={config.popupContent || ''} onChange={(e) => onChange({ popupContent: e.target.value })}
          placeholder="Popup message..." rows={3}
          className="w-full bg-[#f8f7ff] border border-[#e5e3f0] rounded-xl px-3 py-2 text-xs text-[#1a1733] outline-none focus:border-[#7c3aed] resize-none placeholder-[#9896b0]" />
      )}
      {config.outcome === 'swap' && (
        <div>
          <label className="block text-xs font-semibold text-[#9896b0] uppercase tracking-wider mb-2.5">Swap To</label>
          {(() => {
            const swapEl = config.swapElementId
              ? sceneElements?.find(el => el.id === config.swapElementId)
              : null

            if (swapEl) {
              const color = TYPE_COLORS[swapEl.type] || '#7c3aed'
              const bg = TYPE_BG[swapEl.type] || '#f5f3ff'
              return (
                <div className="flex items-center gap-3 p-2.5 rounded-xl border border-[#7c3aed] bg-[#f5f3ff]">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-[#e5e3f0]"
                    style={{ background: swapEl.src ? 'transparent' : bg }}
                  >
                    {swapEl.src && (swapEl.type === 'image' || swapEl.type === 'asset') ? (
                      <img src={swapEl.src} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-[10px] font-bold uppercase" style={{ color }}>
                        {swapEl.type.slice(0, 3)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1a1733] truncate capitalize">{swapEl.content || swapEl.type}</p>
                    <p className="text-[10px] text-[#9896b0] capitalize">{swapEl.type}</p>
                  </div>
                  <button
                    onClick={() => onChange({ swapElementId: undefined })}
                    className="flex-shrink-0 text-[#9896b0] hover:text-red-500 transition-colors"
                    title="Remove swap target"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              )
            }

            return (
              <button
                onClick={onStartSelectSwapTarget}
                className={`w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 border-dashed text-sm font-semibold transition-all ${
                  selectingSwapTarget
                    ? 'border-[#7c3aed] bg-[#f5f3ff] text-[#7c3aed] animate-pulse'
                    : 'border-[#c4c0dc] text-[#5c5880] hover:border-[#7c3aed] hover:text-[#7c3aed] hover:bg-[#f5f3ff]'
                }`}
              >
                <MousePointer size={15} />
                {selectingSwapTarget ? 'Selecting…' : 'Select an element'}
              </button>
            )
          })()}
        </div>
      )}
    </div>
  )
}
