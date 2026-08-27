import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      {/* Main Content */}
      <main className="flex-1 min-w-0 p-8">{children}</main>
    </div>
  )
}
