import { AnimationType } from './AnimatedCopilotAvatar'

export interface LoadingConfig {
  stages: string[]
  duration: number
  animation: AnimationType
}

export const LOADING_CONFIGS: Record<string, LoadingConfig> = {
  'suggest-roles': {
    stages: ['Loading...'],
    duration: 4000,
    animation: 'pulse'
  },

  'view-all-roles': {
    stages: ['Loading...'],
    duration: 4000,
    animation: 'pulse'
  },

  'add-role': {
    stages: ['Loading...'],
    duration: 4000,
    animation: 'pulse'
  },

  'duplicate-role': {
    stages: ['Loading...'],
    duration: 4000,
    animation: 'pulse'
  },

  'rename-role': {
    stages: ['Loading...'],
    duration: 4000,
    animation: 'pulse'
  },

  'modify-permissions': {
    stages: ['Loading...'],
    duration: 4000,
    animation: 'pulse'
  },

  'delete-role': {
    stages: ['Loading...'],
    duration: 4000,
    animation: 'pulse'
  },

  'default': {
    stages: ['Loading...'],
    duration: 4000,
    animation: 'pulse'
  }
}

export function getLoadingConfig(actionId: string): LoadingConfig {
  return LOADING_CONFIGS[actionId] || LOADING_CONFIGS.default
}
