import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  getNavbarCalculators,
  getPrimaryCalculator,
} from '../../domain/calculators/manifest'
import logo from '../../assets/logo.png'

interface NavItem {
  to: string
  label: string
}

const staticNavItems: NavItem[] = [
  { to: '/', label: 'Inicio' },
  { to: '/blog', label: 'Blog' },
  { to: '/sobre', label: 'Sobre' },
]

const calculatorNavItems: NavItem[] = getNavbarCalculators().map((calculator) => ({
  to: calculator.path,
  label: calculator.nav.label,
}))

const navItems: NavItem[] = [...staticNavItems, ...calculatorNavItems]
const primaryCalculatorPath = getPrimaryCalculator()?.path ?? '/'

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
          <img src={logo} alt="Finanzas Claras" className="brand-logo" />
          <span className="brand-text">
            <span>Finanzas Claras</span>
            <span>Educacion financiera</span>
          </span>
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
          <Link to="/#calculadoras" className="site-nav-cta" onClick={() => setOpen(false)}>
            Explorar opciones
          </Link>
        </nav>
      </div>
    </header>
  )
}
