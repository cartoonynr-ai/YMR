import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface print:bg-white print:min-h-0">
      <Sidebar />
      {/* Main Content */}
      <main className="flex-1 min-w-0 p-8 print:p-0 print:m-0">{children}</main>
    </div>
  )
}
