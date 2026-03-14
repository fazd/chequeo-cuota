import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

export function AppLayout() {
  useEffect(() => {
    const shouldBlur = () => window.innerWidth <= 640

    const handleScroll = () => {
      if (!shouldBlur()) {
        return
      }

      const activeElement = document.activeElement as HTMLElement | null
      if (!activeElement) {
        return
      }

      const tagName = activeElement.tagName
      if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
        activeElement.blur()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('touchmove', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('touchmove', handleScroll)
    }
  }, [])

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
