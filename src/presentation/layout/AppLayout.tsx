import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

export function AppLayout() {
  useEffect(() => {
    const shouldBlur = () => window.innerWidth <= 640
    let lastFocusAt = 0
    let isTouchScrolling = false

    const handleScroll = () => {
      if (!shouldBlur()) {
        return
      }

      if (Date.now() - lastFocusAt < 500) {
        return
      }

      if (!isTouchScrolling) {
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

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) {
        return
      }

      const tagName = target.tagName
      if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
        lastFocusAt = Date.now()
      }
    }

    const handleTouchStart = () => {
      isTouchScrolling = false
    }

    const handleTouchMove = () => {
      isTouchScrolling = true
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('focusin', handleFocusIn)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('focusin', handleFocusIn)
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
