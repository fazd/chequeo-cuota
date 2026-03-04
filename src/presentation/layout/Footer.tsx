import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <section>
          <h3 className="site-footer-title">Mis Finanzas Claras</h3>
          <p>Herramientas claras para entender tus finanzas.</p>
        </section>

        <section>
          <h3 className="site-footer-title">Navegacion</h3>
          <div className="site-footer-links">
            <Link to="/">Inicio</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/privacidad">Privacidad</Link>
            <Link to="/terminos">Terminos</Link>
          </div>
        </section>

        <section>
          <h3 className="site-footer-title">Descargo</h3>
          <p>Herramienta informativa. No constituye asesoria financiera.</p>
        </section>

        <section>
          <h3 className="site-footer-title">{new Date().getFullYear()}</h3>
          <p>Todos los derechos reservados.</p>
        </section>
      </div>
    </footer>
  )
}
