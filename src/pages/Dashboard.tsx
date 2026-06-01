import { useState } from 'react'
import Sidebar from '../components/shared/Sidebar'
import TrainingsTab from '../components/homepage/TrainingsTab'
import FoldersTab from '../components/homepage/FoldersTab'
import LearnersTab from '../components/homepage/LearnersTab'
import LibraryTab from '../components/homepage/LibraryTab'
import NotificationsTab from '../components/homepage/NotificationsTab'

type Tab = 'trainings' | 'folders' | 'learners' | 'library' | 'notifications'

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>('trainings')

  const content = () => {
    switch (tab) {
      case 'trainings': return <TrainingsTab />
      case 'folders': return <FoldersTab />
      case 'learners': return <LearnersTab />
      case 'library': return <LibraryTab />
      case 'notifications': return <NotificationsTab />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f8f7ff' }}>
      <Sidebar activeTab={tab} onTabChange={setTab} />
      <main className="flex-1 overflow-hidden" style={{ background: '#f8f7ff' }}>
        {content()}
      </main>
    </div>
  )
}
