export interface Notification {
  id: string
  appName: string
  userInitials: string
  userColor: string
  message: string
  time: string
  isRead: boolean
  isMention: boolean
}

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    appName: 'Sales App',
    userInitials: 'JD',
    userColor: 'bg-blue-600',
    message: "John Doe assigned you a deal — Q3 enterprise renewal with Acme Corp.",
    time: '2 min ago',
    isRead: false,
    isMention: false,
  },
  {
    id: 'n2',
    appName: 'Procurement',
    userInitials: 'MK',
    userColor: 'bg-emerald-600',
    message: 'Purchase request #PR-2304 requires your approval.',
    time: '15 min ago',
    isRead: false,
    isMention: false,
  },
  {
    id: 'n3',
    appName: 'Customer Portal',
    userInitials: 'AR',
    userColor: 'bg-purple-600',
    message: '@you were mentioned in "Refund policy update" discussion.',
    time: '1 hour ago',
    isRead: false,
    isMention: true,
  },
  {
    id: 'n4',
    appName: 'HR Onboarding',
    userInitials: 'SC',
    userColor: 'bg-pink-600',
    message: 'Welcome packet ready for Sarah Chen — review before Monday.',
    time: '3 hours ago',
    isRead: false,
    isMention: false,
  },
  {
    id: 'n5',
    appName: 'Marketing Hub',
    userInitials: 'LV',
    userColor: 'bg-amber-600',
    message: 'Campaign "Spring 2026" moved to Review.',
    time: 'Yesterday',
    isRead: true,
    isMention: false,
  },
  {
    id: 'n6',
    appName: 'Finance App',
    userInitials: 'RB',
    userColor: 'bg-teal-600',
    message: 'Invoice INV-9821 marked as paid. View ledger for details.',
    time: 'Yesterday',
    isRead: true,
    isMention: false,
  },
  {
    id: 'n7',
    appName: 'IT Helpdesk',
    userInitials: 'TM',
    userColor: 'bg-rose-600',
    message: 'Ticket #IT-554 was reopened by the requester.',
    time: '2 days ago',
    isRead: true,
    isMention: false,
  },
  {
    id: 'n8',
    appName: 'Project Tracker',
    userInitials: 'PN',
    userColor: 'bg-indigo-600',
    message: '@you were mentioned in the sprint 12 retrospective notes.',
    time: '2 days ago',
    isRead: true,
    isMention: true,
  },
  {
    id: 'n9',
    appName: 'Customer Portal',
    userInitials: 'HV',
    userColor: 'bg-cyan-600',
    message: '5 new support tickets in the queue need triage.',
    time: '3 days ago',
    isRead: true,
    isMention: false,
  },
  {
    id: 'n10',
    appName: 'Sales App',
    userInitials: 'KO',
    userColor: 'bg-lime-600',
    message: 'Lead "Acme Corp" moved to Negotiation stage.',
    time: '4 days ago',
    isRead: true,
    isMention: false,
  },
]
