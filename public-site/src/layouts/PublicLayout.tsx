import { Outlet } from 'react-router-dom'
import { PublicNavbar } from 'components/PublicNavbar'

export function PublicLayout() {
  return (
    <div className="min-h-screen">
      <PublicNavbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  )
}
