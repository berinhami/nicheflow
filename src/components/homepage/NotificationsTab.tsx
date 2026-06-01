import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useStore } from '../../store'

export default function NotificationsTab() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useStore()
  const unread = notifications.filter((n) => !n.read).length

  const iconAndStyle = (type: string, read: boolean) => {
    const base = read ? 'opacity-50' : ''
    if (type === 'success') return { icon: <CheckCircle2 size={16} className={`text-emerald-500 ${base}`} />, bg: read ? 'bg-white' : 'bg-emerald-50', border: read ? 'border-[#e5e3f0]' : 'border-emerald-200' }
    if (type === 'warning') return { icon: <AlertTriangle size={16} className={`text-amber-500 ${base}`} />, bg: read ? 'bg-white' : 'bg-amber-50', border: read ? 'border-[#e5e3f0]' : 'border-amber-200' }
    return { icon: <Info size={16} className={`text-blue-500 ${base}`} />, bg: read ? 'bg-white' : 'bg-blue-50', border: read ? 'border-[#e5e3f0]' : 'border-blue-200' }
  }

  return (
    <div className="flex flex-col h-full p-6 bg-[#f8f7ff]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1733]">Notifications</h1>
          <p className="text-sm text-[#9896b0] mt-0.5">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllNotificationsRead} className="flex items-center gap-2 text-sm text-[#7c3aed] hover:text-[#6d28d9] font-semibold">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-[#9896b0]">
            <Bell size={40} className="mb-3 opacity-30" />
            <p className="text-sm">No notifications</p>
          </div>
        )}
        {notifications.map((n) => {
          const { icon, bg, border } = iconAndStyle(n.type, n.read)
          return (
            <button
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`w-full flex items-start gap-3 p-4 rounded-2xl text-left transition-all border ${bg} ${border} hover:shadow-sm`}
            >
              <span className="mt-0.5 flex-shrink-0">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${n.read ? 'text-[#9896b0]' : 'text-[#1a1733]'}`}>{n.message}</p>
                <p className="text-xs text-[#9896b0] mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-[#7c3aed] flex-shrink-0 mt-1.5" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
