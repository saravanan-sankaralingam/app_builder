// Conversation flow types

export type ConversationPhase =
  | 'prompt'
  | 'processing'
  | 'analyzing'      // New: Full-screen AI analyzing animation
  | 'name-dialog'    // New: App name/description modal
  | 'clarifying'
  | 'roles'
  | 'app-name'
  | 'stories'
  | 'confirm-generate'
  | 'generating'
  | 'preview'
  | 'building'
  | 'complete'

// Generation step types
export type GenerationStepStatus = 'pending' | 'in-progress' | 'completed'

export interface GenerationStep {
  id: string
  name: string
  description: string
  status: GenerationStepStatus
  duration: number // in milliseconds
}

export interface Role {
  id: string
  name: string
  description: string
  isUserDefined: boolean
  isSelected: boolean
}

export interface UserStory {
  id: string
  role: string
  story: string
  status: 'pending' | 'approved' | 'editing'
}

export interface RoleSuggestionData {
  appName: string
  appDescription: string
  roles: Role[]
}

export interface UserStoriesData {
  roleId: string
  roleName: string
  stories: UserStory[]
}

export interface AppSuggestionData {
  name: string
  description: string
}

// AI suggestion result from analyzing phase
export interface AISuggestionResult {
  appName: string
  appDescription: string
}

// Clarifying questions types
export interface ClarifyingQuestionOption {
  id: string
  label: string
}

export interface ClarifyingQuestion {
  id: string
  question: string
  options: ClarifyingQuestionOption[]
}

export interface ClarifyingQuestionsData {
  questions: ClarifyingQuestion[]
}

export type MessageComponent = 'text' | 'clarifying-questions' | 'role-suggestion' | 'user-stories' | 'confirm-generate'

export interface Message {
  id: string
  type: 'ai' | 'user'
  content: string
  timestamp: Date
  component?: MessageComponent
  data?: AppSuggestionData | RoleSuggestionData | UserStoriesData[] | ClarifyingQuestionsData
}

export interface ConversationState {
  phase: ConversationPhase
  messages: Message[]
  selectedRoles: Role[]
  userStories: UserStoriesData[]
}
