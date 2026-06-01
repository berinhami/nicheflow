import { create } from 'zustand'
import type {
  Training,
  Folder,
  Learner,
  LibraryAsset,
  Comment,
  Notification,
  Scene,
  SceneElement,
  TrainingNode,
} from '../types'

const SAMPLE_SCENE_ID = 'scene-1'
const SAMPLE_TRAINING_ID = 'training-1'
const SAMPLE_FOLDER_ID = 'folder-1'

const sampleTrainings: Training[] = [
  {
    id: SAMPLE_TRAINING_ID,
    name: 'Onboarding 101',
    description: 'New employee onboarding training',
    folderId: SAMPLE_FOLDER_ID,
    scenes: [
      {
        id: SAMPLE_SCENE_ID,
        name: 'Welcome',
        backgroundColor: '#ffffff',
        elements: [],
      },
      { id: 'scene-2', name: 'Introduction', backgroundColor: '#ffffff', elements: [] },
      { id: 'scene-3', name: 'Quiz', backgroundColor: '#ffffff', elements: [] },
    ],
    nodes: [
      { id: 'node-1', sceneId: SAMPLE_SCENE_ID, x: 100, y: 100, connections: [], label: 'Welcome' },
      { id: 'node-2', sceneId: 'scene-2', x: 320, y: 100, connections: [], label: 'Introduction' },
      { id: 'node-3', sceneId: 'scene-3', x: 540, y: 100, connections: [], label: 'Quiz' },
    ],
    thumbnail: '',
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-05-15T10:00:00Z',
    status: 'published',
  },
  {
    id: 'training-2',
    name: 'Safety Training',
    description: 'Annual safety compliance training',
    folderId: SAMPLE_FOLDER_ID,
    scenes: [
      { id: 'scene-4', name: 'Overview', backgroundColor: '#ffffff', elements: [] },
    ],
    nodes: [
      { id: 'node-4', sceneId: 'scene-4', x: 100, y: 100, connections: [], label: 'Overview' },
    ],
    thumbnail: '',
    createdAt: '2026-04-10T10:00:00Z',
    updatedAt: '2026-04-20T10:00:00Z',
    status: 'draft',
  },
  {
    id: 'training-3',
    name: 'Product Deep Dive',
    description: 'In-depth product knowledge training',
    scenes: [
      { id: 'scene-5', name: 'Overview', backgroundColor: '#ffffff', elements: [] },
    ],
    nodes: [
      { id: 'node-5', sceneId: 'scene-5', x: 100, y: 100, connections: [], label: 'Overview' },
    ],
    thumbnail: '',
    createdAt: '2026-03-20T10:00:00Z',
    updatedAt: '2026-05-01T10:00:00Z',
    status: 'published',
  },
]

const sampleFolders: Folder[] = [
  { id: SAMPLE_FOLDER_ID, name: 'HR Trainings', trainingIds: [SAMPLE_TRAINING_ID, 'training-2'], color: '#6366f1' },
  { id: 'folder-2', name: 'Product', trainingIds: ['training-3'], color: '#10b981' },
]

const sampleLearners: Learner[] = [
  { id: 'l1', name: 'Alice Johnson', email: 'alice@example.com', completedTrainingIds: [SAMPLE_TRAINING_ID], inProgressTrainingIds: ['training-2'], joinedAt: '2026-01-15T00:00:00Z' },
  { id: 'l2', name: 'Bob Smith', email: 'bob@example.com', completedTrainingIds: [], inProgressTrainingIds: [SAMPLE_TRAINING_ID], joinedAt: '2026-02-20T00:00:00Z' },
  { id: 'l3', name: 'Carol White', email: 'carol@example.com', completedTrainingIds: [SAMPLE_TRAINING_ID, 'training-3'], inProgressTrainingIds: [], joinedAt: '2026-03-05T00:00:00Z' },
]

const sampleAssets: LibraryAsset[] = [
  { id: 'a1', name: 'company-logo.png', type: 'image', url: '', size: 45000, uploadedAt: '2026-04-01T00:00:00Z' },
  { id: 'a2', name: 'intro-video.mp4', type: 'video', url: '', size: 5200000, uploadedAt: '2026-04-15T00:00:00Z' },
]

const sampleNotifications: Notification[] = [
  { id: 'n1', message: 'Alice Johnson completed Onboarding 101', type: 'success', read: false, createdAt: '2026-05-30T10:00:00Z' },
  { id: 'n2', message: 'Safety Training has 3 new learners', type: 'info', read: false, createdAt: '2026-05-29T10:00:00Z' },
  { id: 'n3', message: 'Product Deep Dive needs review', type: 'warning', read: true, createdAt: '2026-05-28T10:00:00Z' },
]

interface AppState {
  trainings: Training[]
  folders: Folder[]
  learners: Learner[]
  assets: LibraryAsset[]
  comments: Comment[]
  notifications: Notification[]

  activeTrainingId: string | null
  activeSceneId: string | null
  selectedElementId: string | null
  view: 'dashboard' | 'node-builder' | 'scene-editor'

  setView: (view: AppState['view']) => void
  setActiveTraining: (id: string) => void
  setActiveScene: (id: string) => void
  setSelectedElement: (id: string | null) => void

  addTraining: (training: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTraining: (id: string, updates: Partial<Training>) => void
  deleteTraining: (id: string) => void

  addFolder: (folder: Omit<Folder, 'id'>) => void
  updateFolder: (id: string, updates: Partial<Folder>) => void
  deleteFolder: (id: string) => void

  addScene: (trainingId: string, scene: Omit<Scene, 'id'>) => void
  updateScene: (trainingId: string, sceneId: string, updates: Partial<Scene>) => void
  deleteScene: (trainingId: string, sceneId: string) => void

  addElement: (trainingId: string, sceneId: string, element: SceneElement) => void
  updateElement: (trainingId: string, sceneId: string, elementId: string, updates: Partial<SceneElement>) => void
  deleteElement: (trainingId: string, sceneId: string, elementId: string) => void

  addNode: (trainingId: string, node: TrainingNode) => void
  updateNode: (trainingId: string, nodeId: string, updates: Partial<TrainingNode>) => void
  deleteNode: (trainingId: string, nodeId: string) => void

  addAsset: (asset: Omit<LibraryAsset, 'id' | 'uploadedAt'>) => void
  deleteAsset: (id: string) => void

  addComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => void
  resolveComment: (id: string) => void

  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
}

const uid = () => Math.random().toString(36).slice(2, 10)

export const useStore = create<AppState>((set) => ({
  trainings: sampleTrainings,
  folders: sampleFolders,
  learners: sampleLearners,
  assets: sampleAssets,
  comments: [],
  notifications: sampleNotifications,

  activeTrainingId: null,
  activeSceneId: null,
  selectedElementId: null,
  view: 'dashboard',

  setView: (view) => set({ view }),
  setActiveTraining: (id) => set({ activeTrainingId: id }),
  setActiveScene: (id) => set({ activeSceneId: id }),
  setSelectedElement: (id) => set({ selectedElementId: id }),

  addTraining: (t) =>
    set((s) => ({
      trainings: [
        ...s.trainings,
        { ...t, id: uid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ],
    })),
  updateTraining: (id, updates) =>
    set((s) => ({
      trainings: s.trainings.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
    })),
  deleteTraining: (id) =>
    set((s) => ({ trainings: s.trainings.filter((t) => t.id !== id) })),

  addFolder: (f) =>
    set((s) => ({ folders: [...s.folders, { ...f, id: uid() }] })),
  updateFolder: (id, updates) =>
    set((s) => ({ folders: s.folders.map((f) => (f.id === id ? { ...f, ...updates } : f)) })),
  deleteFolder: (id) =>
    set((s) => ({ folders: s.folders.filter((f) => f.id !== id) })),

  addScene: (trainingId, scene) =>
    set((s) => ({
      trainings: s.trainings.map((t) =>
        t.id === trainingId
          ? { ...t, scenes: [...t.scenes, { ...scene, id: uid() }] }
          : t
      ),
    })),
  updateScene: (trainingId, sceneId, updates) =>
    set((s) => ({
      trainings: s.trainings.map((t) =>
        t.id === trainingId
          ? { ...t, scenes: t.scenes.map((sc) => (sc.id === sceneId ? { ...sc, ...updates } : sc)) }
          : t
      ),
    })),
  deleteScene: (trainingId, sceneId) =>
    set((s) => ({
      trainings: s.trainings.map((t) =>
        t.id === trainingId
          ? { ...t, scenes: t.scenes.filter((sc) => sc.id !== sceneId) }
          : t
      ),
    })),

  addElement: (trainingId, sceneId, element) =>
    set((s) => ({
      trainings: s.trainings.map((t) =>
        t.id === trainingId
          ? {
              ...t,
              scenes: t.scenes.map((sc) =>
                sc.id === sceneId ? { ...sc, elements: [...sc.elements, element] } : sc
              ),
            }
          : t
      ),
    })),
  updateElement: (trainingId, sceneId, elementId, updates) =>
    set((s) => ({
      trainings: s.trainings.map((t) =>
        t.id === trainingId
          ? {
              ...t,
              scenes: t.scenes.map((sc) =>
                sc.id === sceneId
                  ? {
                      ...sc,
                      elements: sc.elements.map((el) =>
                        el.id === elementId ? { ...el, ...updates } : el
                      ),
                    }
                  : sc
              ),
            }
          : t
      ),
    })),
  deleteElement: (trainingId, sceneId, elementId) =>
    set((s) => ({
      trainings: s.trainings.map((t) =>
        t.id === trainingId
          ? {
              ...t,
              scenes: t.scenes.map((sc) =>
                sc.id === sceneId
                  ? { ...sc, elements: sc.elements.filter((el) => el.id !== elementId) }
                  : sc
              ),
            }
          : t
      ),
    })),

  addNode: (trainingId, node) =>
    set((s) => ({
      trainings: s.trainings.map((t) =>
        t.id === trainingId ? { ...t, nodes: [...t.nodes, node] } : t
      ),
    })),
  updateNode: (trainingId, nodeId, updates) =>
    set((s) => ({
      trainings: s.trainings.map((t) =>
        t.id === trainingId
          ? { ...t, nodes: t.nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)) }
          : t
      ),
    })),
  deleteNode: (trainingId, nodeId) =>
    set((s) => ({
      trainings: s.trainings.map((t) =>
        t.id === trainingId ? { ...t, nodes: t.nodes.filter((n) => n.id !== nodeId) } : t
      ),
    })),

  addAsset: (asset) =>
    set((s) => ({
      assets: [...s.assets, { ...asset, id: uid(), uploadedAt: new Date().toISOString() }],
    })),
  deleteAsset: (id) =>
    set((s) => ({ assets: s.assets.filter((a) => a.id !== id) })),

  addComment: (comment) =>
    set((s) => ({
      comments: [...s.comments, { ...comment, id: uid(), createdAt: new Date().toISOString() }],
    })),
  resolveComment: (id) =>
    set((s) => ({
      comments: s.comments.map((c) => (c.id === id ? { ...c, resolved: true } : c)),
    })),

  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllNotificationsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),
}))
