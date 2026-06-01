import { Plus, MoreVertical, BookOpen, Clock, User, Trash2, Edit3, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../../store'
import type { Training } from '../../types'

const STATUS_STYLES: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  draft: 'bg-amber-50 text-amber-700 border border-amber-200',
}

const CARD_GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-indigo-500 to-blue-600',
  'from-pink-500 to-rose-600',
  'from-teal-500 to-emerald-600',
]

function TrainingCard({ training, index, onOpen, onDelete }: {
  training: Training
  index: number
  onOpen: () => void
  onDelete: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { learners } = useStore()
  const learnerCount = learners.filter(
    (l) => l.completedTrainingIds.includes(training.id) || l.inProgressTrainingIds.includes(training.id)
  ).length
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length]

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#e5e3f0] hover:border-[#a78bfa] hover:shadow-lg hover:shadow-violet-100 transition-all group cursor-pointer" onClick={onOpen}>
      <div className={`h-28 bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
        <BookOpen size={28} className="text-white/70" />
        <div className={`absolute top-2.5 right-2.5 text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLES[training.status]}`}>
          {training.status}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#1a1733] truncate text-sm">{training.name}</h3>
            {training.description && (
              <p className="text-xs text-[#9896b0] mt-0.5 truncate">{training.description}</p>
            )}
          </div>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setMenuOpen((o) => !o)} className="p-1 rounded-lg text-[#9896b0] hover:text-[#5c5880] hover:bg-[#f1f0f7] transition-colors">
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-7 bg-white border border-[#e5e3f0] rounded-xl shadow-xl z-20 w-36 py-1 overflow-hidden">
                <button onClick={() => { onOpen(); setMenuOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#1a1733] hover:bg-[#f5f3ff]">
                  <ExternalLink size={13} /> Open Builder
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#1a1733] hover:bg-[#f5f3ff]">
                  <Edit3 size={13} /> Rename
                </button>
                <button onClick={() => { onDelete(); setMenuOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#f1f0f7] text-xs text-[#9896b0]">
          <span className="flex items-center gap-1"><BookOpen size={11} /> {training.scenes.length}</span>
          <span className="flex items-center gap-1"><User size={11} /> {learnerCount}</span>
          <span className="flex items-center gap-1 ml-auto"><Clock size={11} /> {new Date(training.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}

export default function TrainingsTab() {
  const { trainings, addTraining, deleteTraining, setActiveTraining, setView } = useStore()
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')

  const handleCreate = () => {
    if (!newName.trim()) return
    addTraining({
      name: newName.trim(),
      description: '',
      scenes: [{ id: `scene-${Date.now()}`, name: 'Scene 1', backgroundColor: '#ffffff', elements: [] }],
      nodes: [],
      thumbnail: '',
      status: 'draft',
    })
    setNewName('')
    setShowNew(false)
  }

  return (
    <div className="flex flex-col h-full p-6 bg-[#f8f7ff]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1733]">My Trainings</h1>
          <p className="text-sm text-[#9896b0] mt-0.5">{trainings.length} training modules</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
        >
          <Plus size={16} /> New Training
        </button>
      </div>

      {showNew && (
        <div className="mb-5 p-4 bg-white border-2 border-[#7c3aed] rounded-2xl flex items-center gap-3 shadow-sm">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowNew(false) }}
            placeholder="Training name..."
            className="flex-1 bg-transparent outline-none text-sm text-[#1a1733] placeholder-[#9896b0]"
          />
          <button onClick={handleCreate} className="text-sm bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-4 py-2 rounded-xl font-semibold">Create</button>
          <button onClick={() => setShowNew(false)} className="text-sm text-[#9896b0] hover:text-[#1a1733] px-2 py-2">Cancel</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto scrollbar-thin">
        {trainings.map((t, i) => (
          <TrainingCard
            key={t.id}
            training={t}
            index={i}
            onOpen={() => { setActiveTraining(t.id); setView('node-builder') }}
            onDelete={() => deleteTraining(t.id)}
          />
        ))}
      </div>
    </div>
  )
}
