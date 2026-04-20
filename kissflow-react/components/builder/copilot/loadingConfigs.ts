import { AnimationType } from './AnimatedCopilotAvatar'

export interface LoadingConfig {
  stages: string[]
  duration: number
  stageDurations?: number[] // Optional: individual duration for each stage (ms)
  animation: AnimationType
}

export const LOADING_CONFIGS: Record<string, LoadingConfig> = {
  'suggest-roles': {
    stages: [
      'Loading...', // 0-2s: shows 3-dot animation
      'Analysing your app structure...', // 2-5s: first text message
      'Suggesting your app roles...' // 5-8s: second text message
    ],
    duration: 8000, // Increased from 4000ms to 8000ms
    stageDurations: [2000, 3000, 3000], // Individual stage timings
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
