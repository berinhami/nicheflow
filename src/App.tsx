import { useStore } from './store'
import Dashboard from './pages/Dashboard'
import NodeBuilder from './components/node-builder/NodeBuilder'
import SceneEditor from './components/scene-editor/SceneEditor'

export default function App() {
  const view = useStore((s) => s.view)

  if (view === 'node-builder') {
    return (
      <div className="flex h-screen overflow-hidden" style={{ background: '#f1f0f7' }}>
        <NodeBuilder />
      </div>
    )
  }

  if (view === 'scene-editor') {
    return (
      <div className="flex h-screen overflow-hidden" style={{ background: '#f1f0f7' }}>
        <SceneEditor />
      </div>
    )
  }

  return <Dashboard />
}
