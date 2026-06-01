import { useCallback, useState, useRef } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type NodeTypes,
  BackgroundVariant,
  MarkerType,
} from 'reactflow'
// @ts-ignore
import 'reactflow/dist/style.css'
import { ArrowLeft, Plus, Eye, Download, MessageSquare, X, Send, CheckCheck } from 'lucide-react'
import { useStore } from '../../store'
import type { Scene } from '../../types'

interface SceneNodeData {
  label: string
  scene: Scene
}

function SceneNodeComponent({ data, selected }: { data: SceneNodeData; selected: boolean }) {
  const { setView, setActiveScene } = useStore()

  const goEdit = () => {
    if (!data.scene?.id) return
    setActiveScene(data.scene.id)
    setView('scene-editor')
  }

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden transition-all ${
        selected
          ? 'border-2 border-[#7c3aed] shadow-xl shadow-violet-200'
          : 'border-2 border-[#e5e3f0] hover:border-[#a78bfa] hover:shadow-lg shadow-sm'
      }`}
      style={{ width: 180 }}
    >
      <Handle type="target" position={Position.Left} style={{ background: '#7c3aed', border: '2px solid #fff', width: 10, height: 10 }} />
      <div
        className="h-24 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center cursor-pointer relative"
        onDoubleClick={goEdit}
      >
        <span className="text-white/80 text-xs font-medium px-2 text-center">{data.scene?.name}</span>
        <div className="absolute bottom-1.5 right-2 text-white/50 text-[10px]">dbl-click to open</div>
      </div>
      <div className="px-3 py-2.5 flex items-center justify-between bg-white">
        <span className="text-xs font-semibold text-[#1a1733] truncate flex-1">{data.label}</span>
        <button
          className="nodrag nowheel text-xs text-[#7c3aed] hover:text-[#6d28d9] font-semibold ml-2 flex-shrink-0 px-2 py-0.5 rounded-lg hover:bg-[#f5f3ff] transition-colors"
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={goEdit}
        >
          Edit
        </button>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: '#7c3aed', border: '2px solid #fff', width: 10, height: 10 }} />
    </div>
  )
}

const nodeTypes: NodeTypes = { scene: SceneNodeComponent as unknown as NodeTypes[string] }

function CommentPanel({ trainingId, onClose }: { trainingId: string; onClose: () => void }) {
  const { comments, addComment, resolveComment } = useStore()
  const [text, setText] = useState('')
  const trainingComments = comments.filter((c) => c.trainingId === trainingId)

  return (
    <div className="w-72 bg-white border-l border-[#e5e3f0] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-[#e5e3f0]">
        <h3 className="text-sm font-semibold text-[#1a1733] flex items-center gap-2">
          <MessageSquare size={15} className="text-[#7c3aed]" /> Comments
        </h3>
        <button onClick={onClose} className="text-[#9896b0] hover:text-[#1a1733]"><X size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
        {trainingComments.length === 0 && <p className="text-xs text-[#9896b0] text-center py-6">No comments yet</p>}
        {trainingComments.map((c) => (
          <div key={c.id} className={`p-3 rounded-xl border text-xs ${c.resolved ? 'border-[#e5e3f0] bg-[#fafafe] text-[#9896b0]' : 'border-[#e5e3f0] bg-white text-[#1a1733]'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold">{c.author}</span>
              {!c.resolved && (
                <button onClick={() => resolveComment(c.id)} className="text-emerald-500 hover:text-emerald-600" title="Resolve">
                  <CheckCheck size={12} />
                </button>
              )}
            </div>
            <p>{c.text}</p>
            <p className="text-[#9896b0] mt-1">{new Date(c.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-[#e5e3f0]">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && text.trim()) { addComment({ trainingId, author: 'Admin', text: text.trim(), resolved: false }); setText('') } }}
            placeholder="Add a comment..."
            className="flex-1 bg-[#f8f7ff] border border-[#e5e3f0] rounded-xl px-3 py-2 text-xs text-[#1a1733] outline-none focus:border-[#7c3aed] placeholder-[#9896b0]"
          />
          <button
            onClick={() => { if (!text.trim()) return; addComment({ trainingId, author: 'Admin', text: text.trim(), resolved: false }); setText('') }}
            className="p-2 bg-[#7c3aed] hover:bg-[#6d28d9] rounded-xl text-white transition-colors"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function NodeBuilder() {
  const { trainings, activeTrainingId, addScene, addNode, updateNode, setView } = useStore()
  const training = trainings.find((t) => t.id === activeTrainingId)
  const [showComments, setShowComments] = useState(false)
  const nodeIdCounter = useRef(Date.now())

  const initialNodes = (training?.nodes || []).map((n) => {
    const scene = training?.scenes.find((s) => s.id === n.sceneId)
    return {
      id: n.id,
      type: 'scene',
      position: { x: n.x, y: n.y },
      data: {
        label: n.label || scene?.name || 'Scene',
        scene: scene!,
      },
    }
  })

  const initialEdges = (training?.nodes || []).flatMap((n) =>
    n.connections.map((target) => ({
      id: `${n.id}-${target}`,
      source: n.id,
      target,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#7c3aed' },
      style: { stroke: '#7c3aed', strokeWidth: 2 },
      animated: true,
    }))
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: '#7c3aed', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#7c3aed' } }, eds)),
    [setEdges]
  )

  const handleAddScene = () => {
    if (!activeTrainingId || !training) return
    const sceneId = `scene-${Date.now()}`
    const nodeId = `node-${nodeIdCounter.current++}`
    const newScene = { id: sceneId, name: `Scene ${training.scenes.length + 1}`, backgroundColor: '#ffffff', elements: [] }
    addScene(activeTrainingId, newScene)
    addNode(activeTrainingId, { id: nodeId, sceneId, x: 100 + nodes.length * 220, y: 200, connections: [], label: newScene.name })
    setNodes((ns) => [...ns, {
      id: nodeId, type: 'scene', position: { x: 100 + nodes.length * 220, y: 200 },
      data: { label: newScene.name, scene: newScene },
    }])
  }

  const handleExport = () => {
    if (!training) return
    const blob = new Blob([JSON.stringify(training, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${training.name.replace(/\s+/g, '-')}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  const handleNodeDragStop = useCallback(
    (_: React.MouseEvent, node: { id: string; position: { x: number; y: number } }) => {
      if (activeTrainingId) updateNode(activeTrainingId, node.id, { x: node.position.x, y: node.position.y })
    },
    [activeTrainingId, updateNode]
  )

  if (!training) return <div className="flex-1 flex items-center justify-center text-[#9896b0]">No training selected</div>

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-[#e5e3f0]">
        <button onClick={() => setView('dashboard')} className="flex items-center gap-1.5 text-sm text-[#5c5880] hover:text-[#1a1733] font-medium transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="w-px h-5 bg-[#e5e3f0]" />
        <span className="text-sm font-bold text-[#1a1733]">{training.name}</span>
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${training.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          {training.status}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-sm text-[#5c5880] hover:text-[#1a1733] bg-[#f8f7ff] hover:bg-[#f1f0f7] border border-[#e5e3f0] px-3 py-1.5 rounded-xl transition-colors font-medium">
            <Eye size={15} /> Preview
          </button>
          <button
            onClick={() => setShowComments((v) => !v)}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl font-medium transition-colors border ${showComments ? 'bg-[#7c3aed] text-white border-[#7c3aed]' : 'text-[#5c5880] hover:text-[#1a1733] bg-[#f8f7ff] hover:bg-[#f1f0f7] border-[#e5e3f0]'}`}
          >
            <MessageSquare size={15} /> Comments
          </button>
          <button onClick={handleAddScene} className="flex items-center gap-1.5 text-sm bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-3 py-1.5 rounded-xl font-semibold transition-colors shadow-sm">
            <Plus size={15} /> Add Scene
          </button>
          <button onClick={handleExport} className="flex items-center gap-1.5 text-sm text-[#5c5880] hover:text-[#1a1733] bg-[#f8f7ff] hover:bg-[#f1f0f7] border border-[#e5e3f0] px-3 py-1.5 rounded-xl transition-colors font-medium">
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1">
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect} onNodeDragStop={handleNodeDragStop}
            nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.3 }}
            minZoom={0.3} maxZoom={2}
          >
            <Background variant={BackgroundVariant.Dots} color="#c4c0dc" gap={20} size={1} />
            <Controls />
            <MiniMap nodeColor="#7c3aed" maskColor="rgba(241,240,247,0.7)" style={{ background: '#fff', border: '1px solid #e5e3f0', borderRadius: 10 }} />
          </ReactFlow>
        </div>
        {showComments && <CommentPanel trainingId={activeTrainingId!} onClose={() => setShowComments(false)} />}
      </div>
    </div>
  )
}
