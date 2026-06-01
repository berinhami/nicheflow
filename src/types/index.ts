export type ElementType =
  | 'header'
  | 'text'
  | 'quiz'
  | 'survey'
  | 'video'
  | 'audio'
  | 'image'
  | 'flashcard'
  | 'shape'
  | 'animation'
  | 'asset'

export type InteractivityType =
  | 'button'
  | 'hoverable'
  | 'draggable'
  | 'dropzone'
  | 'keypad'
  | null

export type ButtonOutcome = 'navigate' | 'open-link' | 'open-popup' | 'swap'
export type HoverOutcome = 'open-popup' | 'swap'
export type DropzoneOutcome = 'navigate' | 'open-popup'
export type KeypadOutcome = 'navigate' | 'open-popup'

export interface InteractivityConfig {
  type: InteractivityType
  outcome?: ButtonOutcome | HoverOutcome | DropzoneOutcome | KeypadOutcome
  targetSceneId?: string
  targetUrl?: string
  popupContent?: string
  swapElementId?: string
  allowedDraggableIds?: string[]
  destinationElementId?: string
  barrierZones?: { x: number; y: number; width: number; height: number }[]
}

export interface SceneElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  content?: string
  src?: string
  interactivity?: InteractivityConfig
  style?: Record<string, string>
  zIndex?: number
  offstage?: 'top' | 'bottom'
}

export interface Scene {
  id: string
  name: string
  elements: SceneElement[]
  backgroundColor?: string
  backgroundImage?: string
}

export interface TrainingNode {
  id: string
  sceneId: string
  x: number
  y: number
  connections: string[]
  label?: string
}

export interface Training {
  id: string
  name: string
  description?: string
  folderId?: string
  scenes: Scene[]
  nodes: TrainingNode[]
  thumbnail?: string
  createdAt: string
  updatedAt: string
  status: 'draft' | 'published'
}

export interface Folder {
  id: string
  name: string
  trainingIds: string[]
  color?: string
}

export interface Learner {
  id: string
  name: string
  email: string
  completedTrainingIds: string[]
  inProgressTrainingIds: string[]
  joinedAt: string
}

export interface LibraryAsset {
  id: string
  name: string
  type: 'image' | 'video' | 'audio'
  url: string
  size: number
  uploadedAt: string
}

export interface Comment {
  id: string
  trainingId: string
  nodeId?: string
  author: string
  text: string
  createdAt: string
  resolved: boolean
}

export interface Notification {
  id: string
  message: string
  type: 'info' | 'success' | 'warning'
  read: boolean
  createdAt: string
}
