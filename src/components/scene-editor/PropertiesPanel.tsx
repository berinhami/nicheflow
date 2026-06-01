import { Zap, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import type { SceneElement } from '../../types'

interface Props {
  element: SceneElement
  onChange: (updates: Partial<SceneElement>) => void
  onDelete: () => void
  onToggleInteractivity: () => void
  onBringForward: () => void
  onSendBackward: () => void
}

export default function PropertiesPanel({ element, onChange, onDelete, onToggleInteractivity, onBringForward, onSendBackward }: Props) {
  return (
    <div className="w-60 bg-white border-l border-[#e5e3f0] flex flex-col overflow-hidden">
      <div className="px-4 py-3.5 border-b border-[#e5e3f0]">
        <p className="text-xs font-bold text-[#1a1733] uppercase tracking-wider">Properties</p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5">

        <Section label="Position & Size">
          <div className="grid grid-cols-2 gap-2">
            <Field label="X" value={element.x} onChange={(v) => onChange({ x: v })} />
            <Field label="Y" value={element.y} onChange={(v) => onChange({ y: v })} />
            <Field label="Width" value={element.width} onChange={(v) => onChange({ width: v })} />
            <Field label="Height" value={element.height} onChange={(v) => onChange({ height: v })} />
          </div>
        </Section>


        <Section label="Style">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#9896b0] font-medium block mb-1.5">Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={element.style?.background || '#f5f3ff'}
                  onChange={(e) => onChange({ style: { ...element.style, background: e.target.value } })}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-[#e5e3f0] bg-transparent"
                />
                <span className="text-xs font-mono text-[#5c5880]">{element.style?.background || '#f5f3ff'}</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-[#9896b0] font-medium block mb-1.5">Border Radius</label>
              <input type="range" min={0} max={32} value={parseInt(element.style?.borderRadius || '0')}
                onChange={(e) => onChange({ style: { ...element.style, borderRadius: e.target.value + 'px' } })}
                className="w-full accent-[#7c3aed]" />
            </div>
            <div>
              <label className="text-xs text-[#9896b0] font-medium block mb-1.5">Opacity</label>
              <input type="range" min={0} max={100} value={parseInt(element.style?.opacity || '100')}
                onChange={(e) => onChange({ style: { ...element.style, opacity: e.target.value } })}
                className="w-full accent-[#7c3aed]" />
            </div>
          </div>
        </Section>

        <Section label="Layer Order">
          <div className="flex gap-2">
            <button onClick={onBringForward} className="flex-1 flex items-center justify-center gap-1 text-xs bg-[#f8f7ff] hover:bg-[#f1f0f7] border border-[#e5e3f0] text-[#5c5880] hover:text-[#1a1733] py-2 rounded-xl font-medium transition-colors">
              <ChevronUp size={13} /> Forward
            </button>
            <button onClick={onSendBackward} className="flex-1 flex items-center justify-center gap-1 text-xs bg-[#f8f7ff] hover:bg-[#f1f0f7] border border-[#e5e3f0] text-[#5c5880] hover:text-[#1a1733] py-2 rounded-xl font-medium transition-colors">
              <ChevronDown size={13} /> Backward
            </button>
          </div>
        </Section>
      </div>

      <div className="p-4 border-t border-[#e5e3f0] space-y-2">
        <button
          onClick={onToggleInteractivity}
          className={`w-full flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl font-semibold transition-colors ${
            element.interactivity
              ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]'
              : 'bg-[#f5f3ff] text-[#7c3aed] hover:bg-[#ede9fe] border border-[#ddd6fe]'
          }`}
        >
          <Zap size={14} /> {element.interactivity ? 'Edit Interactivity' : 'Add Interactivity'}
        </button>
        <button
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl font-semibold bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition-colors"
        >
          <Trash2 size={14} /> Delete Element
        </button>
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#9896b0] uppercase tracking-wider mb-2.5">{label}</p>
      {children}
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-xs text-[#9896b0] font-medium block mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-[#f8f7ff] border border-[#e5e3f0] rounded-lg px-2 py-1.5 text-xs text-[#1a1733] outline-none focus:border-[#7c3aed] font-medium"
      />
    </div>
  )
}
