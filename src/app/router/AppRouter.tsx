import { Suspense, lazy, useEffect, type ElementType } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import {
  getEnabledCalculators,
  type CalculatorRouteComponentKey,
} from '../../domain/calculators/manifest'
import { AppLayout } from '../../presentation/layout/AppLayout'

const Home = lazy(() => import('../../presentation/pages/Home').then((m) => ({ default: m.Home })))
const MortgageAmortizationPage = lazy(() =>
  import('../../presentation/pages/MortgageAmortizationPage').then((m) => ({
    default: m.MortgageAmortizationPage,
  })),
)
const VehicleLoanPage = lazy(() =>
  import('../../presentation/pages/VehicleLoanPage').then((m) => ({
    default: m.VehicleLoanPage,
  })),
)
const PayrollLoanPage = lazy(() =>
  import('../../presentation/pages/PayrollLoanPage').then((m) => ({
    default: m.PayrollLoanPage,
  })),
)
const CreditCardCalculatorPage = lazy(() =>
  import('../../presentation/pages/CreditCardCalculatorPage').then((m) => ({
    default: m.CreditCardCalculatorPage,
  })),
)
const HowItWorksPage = lazy(() =>
  import('../../presentation/pages/HowItWorksPage').then((m) => ({
    default: m.HowItWorksPage,
  })),
)
const BlogIndexPage = lazy(() => import('../../presentation/pages/BlogIndexPage').then((m) => ({ default: m.BlogIndexPage })))
const BlogPostPage = lazy(() => import('../../presentation/pages/BlogPostPage').then((m) => ({ default: m.BlogPostPage })))
const AboutPage = lazy(() => import('../../presentation/pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const PrivacyPage = lazy(() => import('../../presentation/pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))
const TermsPage = lazy(() => import('../../presentation/pages/TermsPage').then((m) => ({ default: m.TermsPage })))
const NotFoundPage = lazy(() => import('../../presentation/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

const calculatorPageByRouteComponent: Record<
  CalculatorRouteComponentKey,
  ElementType
> = {
  mortgage: MortgageAmortizationPage,
  vehicle: VehicleLoanPage,
  payroll: PayrollLoanPage,
  creditCard: CreditCardCalculatorPage,
}

const calculatorRoutes = getEnabledCalculators().map((calculator) => {
  if (!calculator.routeComponent) {
    throw new Error(`Enabled calculator ${calculator.id} is missing routeComponent`)
  }

  return {
    id: calculator.id,
    path: calculator.path,
    Component: calculatorPageByRouteComponent[calculator.routeComponent],
  }
})

function ScrollToHash() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const target = document.querySelector(location.hash)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname, location.hash])

  return null
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <Suspense fallback={<div className="route-loading">Cargando...</div>}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            {calculatorRoutes.map((calculatorRoute) => (
              <Route
                key={calculatorRoute.id}
                path={calculatorRoute.path}
                element={<calculatorRoute.Component />}
              />
            ))}
            <Route path="/blog" element={<BlogIndexPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/sobre" element={<AboutPage />} />
            <Route path="/privacidad" element={<PrivacyPage />} />
            <Route path="/terminos" element={<TermsPage />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
