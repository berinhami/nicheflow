import { Users, CheckCircle2, Clock, Mail } from 'lucide-react'
import { useStore } from '../../store'

const AVATAR_COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#0891b2']

export default function LearnersTab() {
  const { learners, trainings } = useStore()

  return (
    <div className="flex flex-col h-full p-6 bg-[#f8f7ff]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1733]">Learners</h1>
          <p className="text-sm text-[#9896b0] mt-0.5">{learners.length} registered learners</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#e5e3f0] overflow-hidden flex-1 flex flex-col">
        <div className="grid grid-cols-4 px-5 py-3 border-b border-[#f1f0f7] bg-[#fafafe]">
          <span className="text-xs font-semibold text-[#9896b0] uppercase tracking-wider">Learner</span>
          <span className="text-xs font-semibold text-[#9896b0] uppercase tracking-wider">Completed</span>
          <span className="text-xs font-semibold text-[#9896b0] uppercase tracking-wider">In Progress</span>
          <span className="text-xs font-semibold text-[#9896b0] uppercase tracking-wider">Joined</span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-[#f1f0f7]">
          {learners.map((learner, i) => {
            const completed = trainings.filter((t) => learner.completedTrainingIds.includes(t.id))
            const inProgress = trainings.filter((t) => learner.inProgressTrainingIds.includes(t.id))
            const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length]
            return (
              <div key={learner.id} className="grid grid-cols-4 px-5 py-3.5 hover:bg-[#fafafe] transition-colors items-center">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: avatarColor }}>
                    {learner.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#1a1733]">{learner.name}</div>
                    <div className="flex items-center gap-1 text-xs text-[#9896b0]">
                      <Mail size={10} /> {learner.email}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {completed.length === 0 ? <span className="text-xs text-[#9896b0]">—</span> : completed.map((t) => (
                    <span key={t.id} className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                      <CheckCircle2 size={10} /> {t.name}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {inProgress.length === 0 ? <span className="text-xs text-[#9896b0]">—</span> : inProgress.map((t) => (
                    <span key={t.id} className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                      <Clock size={10} /> {t.name}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-[#9896b0]">{new Date(learner.joinedAt).toLocaleDateString()}</span>
              </div>
            )
          })}
        </div>
      </div>

      {learners.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-[#9896b0]">
          <Users size={40} className="mb-3 opacity-30" />
          <p className="text-sm">No learners yet</p>
        </div>
      )}
    </div>
  )
}
