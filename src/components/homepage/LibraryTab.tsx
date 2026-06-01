import { Upload, Image, Film, Music, Trash2, FileImage } from 'lucide-react'
import { useRef } from 'react'
import { useStore } from '../../store'

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function LibraryTab() {
  const { assets, addAsset, deleteAsset } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((file) => {
      const type = file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image'
      addAsset({ name: file.name, type, url: URL.createObjectURL(file), size: file.size })
    })
  }

  const typeIcon = (type: string) => {
    if (type === 'video') return <Film size={22} className="text-blue-500" />
    if (type === 'audio') return <Music size={22} className="text-purple-500" />
    return <Image size={22} className="text-emerald-500" />
  }

  return (
    <div className="flex flex-col h-full p-6 bg-[#f8f7ff]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1733]">Asset Library</h1>
          <p className="text-sm text-[#9896b0] mt-0.5">{assets.length} assets uploaded</p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
        >
          <Upload size={16} /> Upload Assets
        </button>
        <input ref={inputRef} type="file" multiple accept="image/*,video/*,audio/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      <div
        className="bg-white border-2 border-dashed border-[#c4c0dc] rounded-2xl p-8 mb-6 text-center cursor-pointer hover:border-[#7c3aed] hover:bg-[#f5f3ff] transition-all"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
      >
        <div className="w-12 h-12 bg-[#f5f3ff] rounded-2xl flex items-center justify-center mx-auto mb-3">
          <FileImage size={24} className="text-[#7c3aed]" />
        </div>
        <p className="text-sm font-medium text-[#1a1733]">Drop files here or <span className="text-[#7c3aed]">click to upload</span></p>
        <p className="text-xs text-[#9896b0] mt-1">Images, videos, and audio files supported</p>
      </div>

      {assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-[#9896b0]">
          <Image size={40} className="mb-3 opacity-30" />
          <p className="text-sm">No assets yet. Upload some files to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 overflow-y-auto scrollbar-thin">
          {assets.map((asset) => (
            <div key={asset.id} className="group relative bg-white border border-[#e5e3f0] rounded-xl overflow-hidden hover:border-[#a78bfa] hover:shadow-md transition-all">
              <div className="h-20 bg-[#f8f7ff] flex items-center justify-center">
                {asset.type === 'image' && asset.url ? (
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                ) : typeIcon(asset.type)}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-[#1a1733] truncate">{asset.name}</p>
                <p className="text-xs text-[#9896b0]">{formatBytes(asset.size)}</p>
              </div>
              <button
                onClick={() => deleteAsset(asset.id)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
