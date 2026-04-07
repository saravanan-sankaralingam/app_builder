// Mock data for Leave Management App demo

import { AppSuggestionData, RoleSuggestionData, UserStoriesData, ClarifyingQuestion } from './types'

// App suggestions for each prompt type
export const MOCK_APP_SUGGESTION_WITH_ROLES: AppSuggestionData = {
  name: 'Leave Management System',
  description: 'A comprehensive leave management system that enables employees to request time off, managers to handle approvals efficiently, and HR to oversee all leave activities with powerful reporting capabilities.',
}

export const MOCK_APP_SUGGESTION_WITHOUT_ROLES: AppSuggestionData = {
  name: 'Leave Tracker',
  description: 'A streamlined application to manage employee leave requests across your organization, featuring different leave types and an automated approval workflow.',
}

// Response for Prompt 1: Detailed with roles mentioned
export const MOCK_RESPONSE_WITH_ROLES: RoleSuggestionData = {
  appName: 'Leave Management System',
  appDescription: 'A comprehensive leave management system that enables employees to request time off, managers to handle approvals efficiently, and HR to oversee all leave activities with powerful reporting capabilities.',
  roles: [
    {
      id: 'role-1',
      name: 'Employee',
      description: 'Submit leave requests, view leave balance, track request status',
      isUserDefined: true,
      isSelected: true,
    },
    {
      id: 'role-2',
      name: 'Manager',
      description: 'Review and approve/reject team leave requests, view team calendar',
      isUserDefined: true,
      isSelected: true,
    },
    {
      id: 'role-3',
      name: 'HR Admin',
      description: 'Access all leave records, generate reports, manage leave policies',
      isUserDefined: true,
      isSelected: true,
    },
    {
      id: 'role-4',
      name: 'System Admin',
      description: 'Configure leave types, set approval workflows, manage user access',
      isUserDefined: false,
      isSelected: false,
    },
  ],
}

// Response for Prompt 2: Simple without roles
export const MOCK_RESPONSE_WITHOUT_ROLES: RoleSuggestionData = {
  appName: 'Leave Tracker',
  appDescription: 'A streamlined application to manage employee leave requests across your organization, featuring different leave types and an automated approval workflow.',
  roles: [
    {
      id: 'role-1',
      name: 'Employee',
      description: 'Submit leave requests with type and dates, view personal leave history and balance',
      isUserDefined: false,
      isSelected: true,
    },
    {
      id: 'role-2',
      name: 'Manager',
      description: 'Approve or reject leave requests from direct reports, view team availability',
      isUserDefined: false,
      isSelected: true,
    },
    {
      id: 'role-3',
      name: 'HR Administrator',
      description: 'Manage leave policies, view organization-wide reports, handle exceptions',
      isUserDefined: false,
      isSelected: true,
    },
    {
      id: 'role-4',
      name: 'Department Head',
      description: 'Oversee department leave patterns, approve manager leaves',
      isUserDefined: false,
      isSelected: false,
    },
  ],
}

// User stories for each role
export const MOCK_USER_STORIES: UserStoriesData[] = [
  {
    roleId: 'role-1',
    roleName: 'Employee',
    stories: [
      {
        id: 'story-1-1',
        role: 'Employee',
        story: 'As an Employee, I want to submit a leave request with dates and leave type so that I can take time off from work.',
        status: 'pending',
      },
      {
        id: 'story-1-2',
        role: 'Employee',
        story: 'As an Employee, I want to view my leave balance so that I know how many days I have remaining for each leave type.',
        status: 'pending',
      },
      {
        id: 'story-1-3',
        role: 'Employee',
        story: 'As an Employee, I want to track the status of my leave requests so that I know if they are approved or pending.',
        status: 'pending',
      },
      {
        id: 'story-1-4',
        role: 'Employee',
        story: 'As an Employee, I want to cancel a pending leave request so that I can change my plans if needed.',
        status: 'pending',
      },
    ],
  },
  {
    roleId: 'role-2',
    roleName: 'Manager',
    stories: [
      {
        id: 'story-2-1',
        role: 'Manager',
        story: 'As a Manager, I want to view all pending leave requests from my team so that I can review them efficiently.',
        status: 'pending',
      },
      {
        id: 'story-2-2',
        role: 'Manager',
        story: 'As a Manager, I want to approve or reject leave requests so that I can manage team availability.',
        status: 'pending',
      },
      {
        id: 'story-2-3',
        role: 'Manager',
        story: 'As a Manager, I want to see a team calendar view so that I can identify scheduling conflicts.',
        status: 'pending',
      },
    ],
  },
  {
    roleId: 'role-3',
    roleName: 'HR Admin',
    stories: [
      {
        id: 'story-3-1',
        role: 'HR Admin',
        story: 'As an HR Admin, I want to view all leave records across the organization so that I can monitor leave patterns.',
        status: 'pending',
      },
      {
        id: 'story-3-2',
        role: 'HR Admin',
        story: 'As an HR Admin, I want to generate leave reports so that I can provide insights to management.',
        status: 'pending',
      },
      {
        id: 'story-3-3',
        role: 'HR Admin',
        story: 'As an HR Admin, I want to configure leave policies so that different leave types have appropriate rules.',
        status: 'pending',
      },
    ],
  },
]

// Demo prompts
export const DEMO_PROMPTS = {
  withRoles: `I want to build a Leave Management app for our company. Employees should be able to submit leave requests with dates, leave type (sick, vacation, personal), and reason. Managers should be able to view their team's requests and approve or reject them. HR admins should have access to all leave records and be able to generate reports.`,
  withoutRoles: `I need an app to manage employee leave requests in my organization. It should handle different types of leaves and have an approval workflow.`,
}

// AI Welcome message
export const AI_WELCOME_MESSAGE = "Hello! I'm here to help you build your app. Describe your vision and I'll help you define the roles and user stories."

// Simulate AI processing delay
export const simulateProcessing = (ms: number = 2000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Detect if prompt contains role keywords
export const detectRolesInPrompt = (prompt: string): boolean => {
  const roleKeywords = ['employee', 'manager', 'admin', 'user', 'supervisor', 'hr', 'staff', 'owner', 'viewer']
  const lowerPrompt = prompt.toLowerCase()
  return roleKeywords.some(keyword => lowerPrompt.includes(keyword))
}

// Get mock response based on prompt
export const getMockResponse = (prompt: string): RoleSuggestionData => {
  const hasRoles = detectRolesInPrompt(prompt)
  return hasRoles ? MOCK_RESPONSE_WITH_ROLES : MOCK_RESPONSE_WITHOUT_ROLES
}

// Get mock app suggestion based on prompt
export const getMockAppSuggestion = (prompt: string): AppSuggestionData => {
  const hasRoles = detectRolesInPrompt(prompt)
  return hasRoles ? MOCK_APP_SUGGESTION_WITH_ROLES : MOCK_APP_SUGGESTION_WITHOUT_ROLES
}

// Clarifying questions data
export const CLARIFYING_QUESTIONS: Record<string, ClarifyingQuestion> = {
  teamSize: {
    id: 'team-size',
    question: 'How large is your team?',
    options: [
      { id: 'small', label: '1-10' },
      { id: 'medium', label: '10-50' },
      { id: 'large', label: '50+' },
    ]
  },
  industry: {
    id: 'industry',
    question: "What's your industry?",
    options: [
      { id: 'hr', label: 'HR' },
      { id: 'sales', label: 'Sales' },
      { id: 'operations', label: 'Operations' },
      { id: 'finance', label: 'Finance' },
      { id: 'healthcare', label: 'Healthcare' },
      { id: 'other', label: 'Other' },
    ]
  }
}

// Analyze prompt and return questions if needed
export const analyzePromptForQuestions = (prompt: string): ClarifyingQuestion[] => {
  const questions: ClarifyingQuestion[] = []
  const lowerPrompt = prompt.toLowerCase()

  // Check if industry/domain is mentioned
  const industryKeywords = ['hr', 'sales', 'finance', 'healthcare', 'operations', 'marketing', 'retail', 'manufacturing', 'education', 'legal']
  const hasIndustry = industryKeywords.some(k => lowerPrompt.includes(k))
  if (!hasIndustry) {
    questions.push(CLARIFYING_QUESTIONS.industry)
  }

  // Check if scale/team size is mentioned
  const scaleKeywords = ['team', 'company', 'organization', 'enterprise', 'small', 'large', 'startup', 'employees', 'members', 'people']
  const hasScale = scaleKeywords.some(k => lowerPrompt.includes(k))
  if (!hasScale) {
    questions.push(CLARIFYING_QUESTIONS.teamSize)
  }

  return questions
}
