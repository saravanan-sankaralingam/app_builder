'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LayoutGrid, GitBranch, LayoutDashboard, Globe, Database, Plug } from 'lucide-react'
import { CreateOptionCard } from './CreateOptionCard'

const createOptions = [
  {
    id: 'app',
    icon: LayoutGrid,
    iconBg: '#FCE7F3',
    iconColor: '#DB2777',
    title: 'App',
    description: 'Build end-to-end apps with no-code and low-code tools.',
  },
  {
    id: 'process',
    icon: GitBranch,
    iconBg: '#FED7AA',
    iconColor: '#EA580C',
    title: 'Process',
    description: 'Create structured workflows that follow sequential steps based on form data.',
  },
  {
    id: 'board',
    icon: LayoutDashboard,
    iconBg: '#E0E7FF',
    iconColor: '#4F46E5',
    title: 'Board',
    description: 'Create highly adaptable workflows to track and manage projects and cases.',
  },
  {
    id: 'portal',
    icon: Globe,
    iconBg: '#FCE7F3',
    iconColor: '#DB2777',
    title: 'Portal',
    description: 'Create public-facing apps with which users outside your organization can interact.',
  },
  {
    id: 'dataset',
    icon: Database,
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
    title: 'Dataset',
    description: 'Store your data in customizable rows and columns that support a variety of fields.',
  },
  {
    id: 'integration',
    icon: Plug,
    iconBg: '#EDE9FE',
    iconColor: '#9333EA',
    title: 'Integration',
    description: 'Automate business workflows by connecting your desired Kissflow apps and third-party services.',
  },
]

export function CreateView() {
  const router = useRouter()

  const handleOptionClick = (optionId: string) => {
    if (optionId === 'app') {
      router.push('/create/app')
    } else {
      console.log('Selected option:', optionId)
      // Add your navigation or creation logic here for other options
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 p-6">
      {/* Header with Back Button and Title */}
      <div className="relative mb-8">
        {/* Back Button - Aligned to left edge */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="absolute left-0 w-11 h-11 bg-gray-100 hover:bg-gray-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Title - Centered */}
        <h1 className="text-3xl font-semibold text-gray-900 text-center">
          Create from scratch
        </h1>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Cards List */}
        <div className="space-y-3">
          {createOptions.map((option) => (
            <CreateOptionCard
              key={option.id}
              icon={option.icon}
              iconBg={option.iconBg}
              iconColor={option.iconColor}
              title={option.title}
              description={option.description}
              onClick={() => handleOptionClick(option.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
