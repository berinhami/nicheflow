import { Plus, Folder, BookOpen, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../../store'

const FOLDER_COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#0891b2']

export default function FoldersTab() {
  const { folders, trainings, addFolder, deleteFolder, updateFolder, setActiveTraining, setView } = useStore()
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(FOLDER_COLORS[0])

  const handleCreate = () => {
    if (!newName.trim()) return
    addFolder({ name: newName.trim(), trainingIds: [], color: newColor })
    setNewName('')
    setShowNew(false)
  }

  return (
    <div className="flex flex-col h-full p-6 bg-[#f8f7ff]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1733]">Folders</h1>
          <p className="text-sm text-[#9896b0] mt-0.5">Organize trainings into groups</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
        >
          <Plus size={16} /> New Folder
        </button>
      </div>

      {showNew && (
        <div className="mb-5 p-4 bg-white border-2 border-[#7c3aed] rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowNew(false) }}
              placeholder="Folder name..."
              className="flex-1 bg-transparent outline-none text-sm text-[#1a1733] placeholder-[#9896b0]"
            />
            <button onClick={handleCreate} className="text-sm bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-4 py-2 rounded-xl font-semibold">Create</button>
            <button onClick={() => setShowNew(false)} className="text-sm text-[#9896b0] hover:text-[#1a1733] px-2 py-2">Cancel</button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-[#9896b0]">Color:</span>
            {FOLDER_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={`w-5 h-5 rounded-full transition-transform ${newColor === c ? 'scale-125 ring-2 ring-offset-2' : ''}`}
                style={{ background: c, ringColor: c }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto scrollbar-thin">
        {folders.map((folder) => {
          const folderTrainings = trainings.filter((t) => folder.trainingIds.includes(t.id))
          return (
            <div key={folder.id} className="bg-white rounded-2xl overflow-hidden border border-[#e5e3f0] hover:shadow-md transition-all">
              <div className="h-1.5 w-full" style={{ background: folder.color || '#7c3aed' }} />
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: (folder.color || '#7c3aed') + '18' }}>
                      <Folder size={16} style={{ color: folder.color || '#7c3aed' }} />
                    </div>
                    <span className="font-semibold text-[#1a1733] text-sm">{folder.name}</span>
                  </div>
                  <button onClick={() => deleteFolder(folder.id)} className="p-1.5 rounded-lg text-[#9896b0] hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
                {folderTrainings.length === 0 ? (
                  <p className="text-xs text-[#9896b0] italic py-2">No trainings in this folder</p>
                ) : (
                  <div className="space-y-1.5">
                    {folderTrainings.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { setActiveTraining(t.id); setView('node-builder') }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f8f7ff] hover:bg-[#f1f0f7] text-sm text-[#1a1733] transition-colors text-left border border-transparent hover:border-[#e5e3f0]"
                      >
                        <BookOpen size={12} className="flex-shrink-0 text-[#9896b0]" />
                        <span className="truncate flex-1 font-medium">{t.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${t.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {t.status}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#f1f0f7]">
                  <span className="text-xs text-[#9896b0]">{folderTrainings.length} training{folderTrainings.length !== 1 ? 's' : ''}</span>
                  <select
                    className="ml-auto text-xs bg-[#f8f7ff] border border-[#e5e3f0] text-[#5c5880] rounded-lg px-2 py-1 outline-none focus:border-[#7c3aed]"
                    defaultValue=""
                    onChange={(e) => {
                      if (!e.target.value) return
                      updateFolder(folder.id, { trainingIds: [...new Set([...folder.trainingIds, e.target.value])] })
                      e.target.value = ''
                    }}
                  >
                    <option value="">+ Add training</option>
                    {trainings.filter((t) => !folder.trainingIds.includes(t.id)).map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
