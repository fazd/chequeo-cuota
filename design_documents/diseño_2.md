# Finanzas claras - Plan de Producto, Navegacion y Contenido

## Proposito de este Documento

Este documento complementa `plan_inicial.md`.

Mientras el plan inicial define el MVP tecnico de la calculadora,
este documento define:

- Arquitectura de navegacion
- Sistema de layout global
- Blog dinamico con MDX
- Paginas institucionales
- SEO tecnico
- Analytics
- Preparacion para escalabilidad de producto

---

# 1. Vision del Producto

El MVP evoluciona de una simple calculadora a una plataforma educativa financiera llamada:

**Finanzas claras**

Objetivo:

- Validar calculos financieros.
- Educar al usuario.
- Generar trafico organico.
- Preparar terreno para futuras calculadoras.

El sistema seguira siendo:

- 100% Frontend
- Stateless
- Sin autenticacion
- Sin almacenamiento de datos del usuario

---

# 2. Arquitectura de Navegacion

Se agregara React Router.

## Rutas principales
/
/blog
/blog/:slug
/sobre
/privacidad
/terminos



## Reglas

- Cada pagina debe tener meta tags propios.
- Debe existir pagina 404.
- URLs deben ser limpias y en minusculas.

---

# 3. Layout Global

Se creara un layout reutilizable.

## 3.1 Estructura

```
Layout
├── Navbar
├── Main (children)
└── Footer

```

Todas las paginas usaran este layout.

---

# 4. Navbar (Header)

## Requerimientos

- Logo texto: "Finanzas claras"
- Links:
  - Inicio
  - Como funciona
  - Blog
  - Sobre
- Boton CTA destacado:
  - "Calcular credito"

## Comportamiento

- Sticky top.
- Responsive.
- Menu hamburguesa en mobile.
- Sombra ligera al hacer scroll.

---

# 5. Footer

## Secciones

### Seccion 1
- Logo pequeño.
- Descripcion corta:
  "Herramientas claras para entender tus finanzas."

### Seccion 2
Links:
- Inicio
- Blog
- Privacidad
- Terminos

### Seccion 3
Disclaimer corto:
"Herramienta informativa. No constituye asesoria financiera."

### Seccion 4
Año dinamico.

---

# 6. Home como Landing

La pagina Home ahora cumple doble funcion:

- Landing SEO
- Calculadora principal

## Secciones

1. Hero
2. Explicacion breve
3. Calculadora
4. Resultados
5. Seccion "Proximamente"
6. FAQ corta

---

# 7. Seccion Proximamente

Se agregaran cards deshabilitadas para:

- Credito vehicular
- Credito de libranza
- Tarjeta de credito
- CDT
- Cuentas alto rendimiento (Nu, Pibank, Lulo)

Solo visuales.
Sin funcionalidad.
Preparadas para activarse en futuras iteraciones.

---

# 8. Pagina "Como Funciona"

Contenido educativo estructurado:

## Secciones

- Que es el sistema frances.
- Formula matematica.
- Conversion EA a mensual.
- Interpretacion de tabla.
- Por que puede diferir del banco.

Debe renderizar formula en formato LaTeX.

---

# 9. Blog - Sistema MDX

## Objetivo

Permitir agregar articulos sin modificar codigo.

## Ubicacion


src/content/blog/


## Reglas

- Cada archivo `.mdx` representa un articulo.
- El nombre del archivo define el slug.
- Espacios se convierten en guiones.
- Todo en minusculas.

Ejemplo:

sistema frances.mdx
Ruta:/blog/sistema-frances


## BlogIndex

Debe:

- Leer automaticamente la carpeta.
- Listar articulos.
- Mostrar:
  - Titulo
  - Fecha
  - Extracto
  - Link

## BlogPost

Debe:

- Renderizar dinamicamente el MDX.
- Manejar slug invalido.
- Mostrar 404 si no existe.

---

# 10. SEO Tecnico

Se debe implementar:

- Meta title por pagina.
- Meta description.
- Open Graph.
- Sitemap.xml generado manualmente.
- robots.txt.
- Canonical URLs.

Home debe tener:

Title ejemplo:
"Calculadora de Credito de Vivienda en Colombia - Sistema Frances"

---

# 11. Analytics

Se integrara:

@vercel/analytics

## Eventos obligatorios

- calculo_realizado
- csv_exportado
- visita_blog

No enviar datos financieros.
No enviar datos personales.

---

# 12. Paginas Institucionales

## 12.1 Sobre el Proyecto

Contenido:

- Por que existe la herramienta.
- Independencia de bancos.
- No almacenamiento de datos.
- Contacto por email.

---

## 12.2 Politica de Privacidad

Debe explicar:

- Uso de Vercel Analytics.
- No almacenamiento de datos financieros.
- No recoleccion de datos personales.
- Uso minimo de cookies tecnicas.

---

## 12.3 Terminos y Descargo

Debe incluir:

"Esta herramienta es solo informativa. No constituye asesoria financiera. Los calculos son estimaciones basadas en los datos ingresados por el usuario."

---

# 13. Preparacion para Escalabilidad

La arquitectura debe permitir:

- Agregar nuevas calculadoras como modulos independientes.
- Crear carpeta:
src/domain/calculators/


Para futuras extensiones.

- Posible integracion futura de backend sin romper dominio.

---

# 14. Performance

Objetivos:

- Lighthouse > 90.
- Lazy load del Blog.
- Lazy load de graficas.
- Minimizar bundle inicial.

---

# 15. Definicion de Exito

Metricas iniciales:

- % visitas que realizan calculo.
- % que exportan CSV.
- Tiempo promedio en pagina.
- Trafico organico.

---

# 16. No Alcances de esta Fase

No incluye:

- Login.
- Guardado de creditos.
- Comparacion multi-escenario.
- Abonos extraordinarios (solo firma preparada).
- Monetizacion activa.

---

# 17. Filosofia de Evolucion

El sistema debe evolucionar en este orden:

1. Calculadora robusta.
2. Contenido educativo.
3. Trafico organico.
4. Nuevas calculadoras.
5. Simulaciones avanzadas.
6. Monetizacion.