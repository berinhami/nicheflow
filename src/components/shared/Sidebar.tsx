import {
  LayoutDashboard,
  Layers,
  Users,
  Image,
  Bell,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../../store'

const Logo = ({ collapsed }: { collapsed: boolean }) => (
  <div className={`flex items-center gap-2.5 px-4 py-5 border-b border-[#e5e3f0] ${collapsed ? 'justify-center px-0' : ''}`}>
    <div className="w-8 h-8 rounded-xl bg-[#7c3aed] flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-sm">
      N
    </div>
    {!collapsed && (
      <span className="font-bold text-[#1a1733] text-base tracking-tight">NicheFlow</span>
    )}
  </div>
)

interface NavItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  badge?: number
  onClick?: () => void
  collapsed?: boolean
}

const NavItem = ({ icon, label, active, badge, onClick, collapsed }: NavItemProps) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all ${
      active
        ? 'bg-[#7c3aed] text-white shadow-sm'
        : 'text-[#5c5880] hover:text-[#1a1733] hover:bg-[#f1f0f7]'
    } ${collapsed ? 'justify-center px-0' : ''}`}
  >
    <span className="flex-shrink-0">{icon}</span>
    {!collapsed && <span className="flex-1 text-left truncate font-medium">{label}</span>}
    {!collapsed && badge ? (
      <span className="ml-auto bg-[#7c3aed] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
        {badge}
      </span>
    ) : null}
  </button>
)

type Tab = 'trainings' | 'folders' | 'learners' | 'library' | 'notifications'

interface SidebarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const notifications = useStore((s) => s.notifications)
  const unread = notifications.filter((n) => !n.read).length

  return (
    <div
      className={`relative flex flex-col bg-white border-r border-[#e5e3f0] transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
      style={{ boxShadow: '1px 0 0 #e5e3f0' }}
    >
      <Logo collapsed={collapsed} />

      <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto scrollbar-thin">
        <NavItem icon={<LayoutDashboard size={18} />} label="Trainings" active={activeTab === 'trainings'} onClick={() => onTabChange('trainings')} collapsed={collapsed} />
        <NavItem icon={<Layers size={18} />} label="Folders" active={activeTab === 'folders'} onClick={() => onTabChange('folders')} collapsed={collapsed} />
        <NavItem icon={<Users size={18} />} label="Learners" active={activeTab === 'learners'} onClick={() => onTabChange('learners')} collapsed={collapsed} />
        <NavItem icon={<Image size={18} />} label="Asset Library" active={activeTab === 'library'} onClick={() => onTabChange('library')} collapsed={collapsed} />

        <div className="pt-2 mt-2 border-t border-[#e5e3f0]">
          <NavItem icon={<Bell size={18} />} label="Notifications" active={activeTab === 'notifications'} badge={unread} onClick={() => onTabChange('notifications')} collapsed={collapsed} />
          <NavItem icon={<HelpCircle size={18} />} label="Help" collapsed={collapsed} />
        </div>
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-white border border-[#e5e3f0] flex items-center justify-center text-[#9896b0] hover:text-[#7c3aed] hover:border-[#7c3aed] shadow-sm z-10 transition-colors"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </div>
  )
}
