import { WelcomeBanner } from '@/components/home/WelcomeBanner'
import { ItemsInQueue } from '@/components/home/ItemsInQueue'
import { MyTodo } from '@/components/home/MyTodo'
import { ItemsCreatedByMe } from '@/components/home/ItemsCreatedByMe'
import { TaggedComments } from '@/components/home/TaggedComments'
import { RecentlyAccessed } from '@/components/home/RecentlyAccessed'

export default function HomePage() {
  // Placeholder until real user context is wired.
  const userName = 'Saravanan Sankaralingam'

  return (
    <div className="min-h-full bg-gray-50 p-6">
      <WelcomeBanner userName={userName} />

      {/* Top grid: queue + (todo / tagged comments column) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <ItemsInQueue />
          <ItemsCreatedByMe />
        </div>
        <div className="flex flex-col gap-4">
          <MyTodo />
          <TaggedComments />
        </div>
      </div>

      {/* Bottom row: full-width Recently accessed */}
      <RecentlyAccessed />
    </div>
  )
}
