import { Type, AlignLeft, HelpCircle, BarChart2, Film, Music, Image, Layers, Square, Sparkles, ImagePlus } from 'lucide-react'
import type { ElementType } from '../../types'

interface PaletteItem {
  type: ElementType
  label: string
  icon: React.ReactNode
  color: string
  bg: string
}

const ELEMENTS: PaletteItem[] = [
  { type: 'header',    label: 'Header',      icon: <Type size={16} />,       color: '#7c3aed', bg: '#f5f3ff' },
  { type: 'text',      label: 'Text',        icon: <AlignLeft size={16} />,  color: '#2563eb', bg: '#eff6ff' },
  { type: 'quiz',      label: 'Quiz',        icon: <HelpCircle size={16} />, color: '#d97706', bg: '#fffbeb' },
  { type: 'survey',    label: 'Survey',      icon: <BarChart2 size={16} />,  color: '#059669', bg: '#f0fdf4' },
  { type: 'video',     label: 'Video',       icon: <Film size={16} />,       color: '#2563eb', bg: '#eff6ff' },
  { type: 'audio',     label: 'Audio',       icon: <Music size={16} />,      color: '#7c3aed', bg: '#f5f3ff' },
  { type: 'image',     label: 'Image',       icon: <Image size={16} />,      color: '#0891b2', bg: '#ecfeff' },
  { type: 'flashcard', label: 'Flash Cards', icon: <Layers size={16} />,     color: '#dc2626', bg: '#fef2f2' },
  { type: 'shape',     label: 'Shape',       icon: <Square size={16} />,     color: '#64748b', bg: '#f8fafc' },
  { type: 'animation', label: 'Animation',   icon: <Sparkles size={16} />,   color: '#d97706', bg: '#fffbeb' },
  { type: 'asset',     label: 'Asset',       icon: <ImagePlus size={16} />,  color: '#059669', bg: '#f0fdf4' },
]

interface Props {
  onDragStart: (type: ElementType) => void
}

export default function ElementPalette({ onDragStart }: Props) {
  return (
    <div className="w-52 bg-white border-r border-[#e5e3f0] flex flex-col overflow-hidden">
      <div className="px-4 py-3.5 border-b border-[#e5e3f0]">
        <p className="text-xs font-bold text-[#1a1733] uppercase tracking-wider">Elements</p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2.5 space-y-0.5">
        {ELEMENTS.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => { e.dataTransfer.setData('elementType', item.type); onDragStart(item.type) }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-grab active:cursor-grabbing hover:bg-[#f8f7ff] transition-colors select-none group"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" style={{ background: item.bg, color: item.color }}>
              {item.icon}
            </div>
            <span className="text-sm font-medium text-[#1a1733]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
