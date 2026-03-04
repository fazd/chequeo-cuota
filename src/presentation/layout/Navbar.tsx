import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Inicio' },
  { to: '/como-funciona', label: 'Como funciona' },
  { to: '/blog', label: 'Blog' },
  { to: '/sobre', label: 'Sobre' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }

    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`site-navbar${scrolled ? ' with-shadow' : ''}`}>
      <div className="site-navbar-inner">
        <Link to="/" className="brand">
          Mis Finanzas Claras
        </Link>

        <button
          type="button"
          className="menu-toggle"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label="Abrir menu"
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`site-nav${open ? ' open' : ''}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `site-nav-link${isActive ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to="/amortización-credito-vivienda"
            className="site-nav-cta"
            onClick={() => setOpen(false)}
          >
            Amortizacion vivienda
          </Link>
        </nav>
      </div>
    </header>
  )
}
