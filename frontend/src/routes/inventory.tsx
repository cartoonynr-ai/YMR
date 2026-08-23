import { createFileRoute, redirect } from '@tanstack/react-router'
import AppLayout from '../components/layout/AppLayout'

export const Route = createFileRoute('/inventory')({
  beforeLoad: () => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw redirect({ to: '/' })
    }
  },
  component: Inventory,
})

function Inventory() {
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
      <p className="text-gray-500 mt-2">หน้านี้อยู่ระหว่างการพัฒนา (Coming soon)</p>
    </AppLayout>
  )
}
