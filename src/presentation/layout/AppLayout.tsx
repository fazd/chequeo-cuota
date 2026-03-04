import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

export function AppLayout() {
  return (
    <div className="site-layout">
      <Navbar />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
