import { useCallback } from 'react'
import ReactFlow, {
  Background, Controls, Handle, Position,
  useNodesState, useEdgesState, type Connection,
  MarkerType, BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { X, MapPin } from 'lucide-react'
import type { Scene } from '../../types'

interface Props {
  scenes: Scene[]
  currentSceneId: string
  targetSceneId?: string
  onSelect: (sceneId: string) => void
  onClose: () => void
}

function SceneNode({ data }: { data: { label: string; isCurrent: boolean; isTarget: boolean } }) {
  return (
    <div
      style={{
        background: data.isCurrent ? '#7c3aed' : data.isTarget ? '#f5f3ff' : '#fff',
        border: `2px solid ${data.isCurrent ? '#7c3aed' : data.isTarget ? '#a78bfa' : '#e5e3f0'}`,
        borderRadius: 12,
        padding: '10px 18px',
        minWidth: 130,
        color: data.isCurrent ? '#fff' : '#1a1733',
        fontWeight: 600,
        fontSize: 13,
        textAlign: 'center',
        boxShadow: data.isCurrent ? '0 4px 12px rgba(124,58,237,0.3)' : data.isTarget ? '0 2px 8px rgba(124,58,237,0.15)' : '0 1px 4px rgba(0,0,0,0.06)',
        position: 'relative',
      }}
    >
      {data.isCurrent && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: '#fff', border: '2.5px solid #7c3aed', width: 13, height: 13 }}
        />
      )}
      {!data.isCurrent && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: '#7c3aed', border: '2.5px solid #fff', width: 13, height: 13 }}
        />
      )}
      {data.isCurrent && (
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', opacity: 0.7, marginBottom: 3, textTransform: 'uppercase' }}>
          Current
        </div>
      )}
      {data.label}
    </div>
  )
}

const nodeTypes = { scene: SceneNode as unknown as React.ComponentType<any> }

export default function SceneFlowPicker({ scenes, currentSceneId, targetSceneId, onSelect, onClose }: Props) {
  const COLS = 3
  const COL_GAP = 220
  const ROW_GAP = 130

  const initialNodes = scenes.map((s, i) => ({
    id: s.id,
    type: 'scene',
    position: { x: (i % COLS) * COL_GAP + 40, y: Math.floor(i / COLS) * ROW_GAP + 40 },
    data: {
      label: s.name,
      isCurrent: s.id === currentSceneId,
      isTarget: s.id === targetSceneId,
    },
    draggable: true,
  }))

  const initialEdges = targetSceneId ? [{
    id: `${currentSceneId}->${targetSceneId}`,
    source: currentSceneId,
    target: targetSceneId,
    animated: true,
    style: { stroke: '#7c3aed', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#7c3aed' },
  }] : []

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback((connection: Connection) => {
    if (connection.source !== currentSceneId) return
    if (!connection.target || connection.target === currentSceneId) return
    setEdges(() => [{
      id: `${currentSceneId}->${connection.target}`,
      source: currentSceneId,
      target: connection.target!,
      animated: true,
      style: { stroke: '#7c3aed', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#7c3aed' },
    }])
    onSelect(connection.target)
  }, [currentSceneId, onSelect, setEdges])

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 100, background: 'rgba(15,10,30,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ width: 720, height: 500 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e3f0] flex-shrink-0">
          <div>
            <h3 className="text-sm font-bold text-[#1a1733] flex items-center gap-2">
              <MapPin size={15} className="text-[#7c3aed]" />
              Select Destination Scene
            </h3>
            <p className="text-xs text-[#9896b0] mt-0.5">
              Drag from the <span className="font-semibold text-[#7c3aed]">current scene</span> handle to connect it to a destination
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#9896b0] hover:text-[#1a1733] transition-colors p-1 rounded-lg hover:bg-[#f1f0f7]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Flow canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.3}
            maxZoom={2}
            deleteKeyCode={null}
          >
            <Background variant={BackgroundVariant.Dots} color="#c4c0dc" gap={20} size={1} />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}
