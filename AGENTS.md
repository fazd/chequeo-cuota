# AGENTS.md - Decisiones de Arquitectura

## Objetivo del documento
Este archivo resume las decisiones arquitectonicas vigentes del proyecto `chequeo-cuota` para guiar trabajo futuro de agentes y desarrolladores.

## 1) Vision de producto y alcance
El proyecto evoluciona de una calculadora unica a una plataforma educativa financiera llamada **Mis Finanzas Claras**.

Principios vigentes:
- 100% frontend.
- Stateless.
- Sin autenticacion.
- Sin almacenamiento de datos financieros del usuario.

## 2) Arquitectura en capas (desacoplada)
Se mantiene separacion estricta de responsabilidades:

- `domain/`: reglas financieras puras y tipos del dominio.
- `application/`: casos de uso, agregados, analytics tipado y resolucion de contenido.
- `presentation/`: UI React, layout, paginas y componentes.
- `utils/`: utilidades transversales.

Reglas:
- `domain` NO importa React.
- `application` NO importa React.
- `presentation` puede importar `application` y `domain`.

## 3) Navegacion y layout global
Se adopta React Router con rutas canonicas:

- `/`
- `/como-funciona`
- `/blog`
- `/blog/:slug`
- `/sobre`
- `/privacidad`
- `/terminos`
- `*` (404)

Toda pagina debe vivir dentro de un layout unico:
- `Navbar` sticky responsive.
- `Main` con contenido por ruta.
- `Footer` institucional.

## 4) Motor financiero como nucleo de negocio
El calculo hipotecario bajo sistema frances permanece como nucleo estable:

- Conversion de tasa EA a mensual.
- Simulacion mes a mes.
- Cierre de saldo en ultima cuota.
- Comparacion entre escenario base y escenario con aportes.

Precision:
- No redondear internamente para calculo.
- Redondear solo para presentacion y exportacion.

## 5) Contratos de dominio
`LoanInput` concentra entradas funcionales.
`AmortizationRow` describe detalle mensual.
`LoanProjection` incluye:
- `schedule` (escenario actual).
- `baselineSchedule` (sin aportes).
- metricas agregadas de comparacion.

## 6) Estrategia de aportes (estado actual)
Estrategia activa:
- Reducir capital y tiempo manteniendo cuota.

Tipos soportados:
- Aporte periodico.
- Aporte extraordinario por mes.

## 7) Blog dinamico con MDX
El blog se construye desde archivos en `src/content/blog/`:

- Cada `.mdx` representa un articulo.
- Slug normalizado en minusculas con guiones.
- Frontmatter requerido: `title`, `date`, `excerpt`.

Contratos:
- `BlogFrontmatter`.
- `BlogPostMeta`.

Funciones base:
- `getAllBlogPosts()`.
- `getBlogPostBySlug(slug)`.

Regla:
- Slug invalido o inexistente retorna 404 de contenido.

## 8) SEO tecnico obligatorio
Baseline SEO por pagina:
- `title`.
- `description`.
- Open Graph.
- `canonical`.

Archivos tecnicos obligatorios en `public/`:
- `robots.txt`.
- `sitemap.xml`.

## 9) Observabilidad y privacidad
Se usa `@vercel/analytics` con eventos tipados y sin PII:

Eventos permitidos:
- `calculo_realizado`.
- `csv_exportado`.
- `visita_blog`.

Regla:
- No enviar montos, tasas ni informacion personal en payloads.

## 10) Extensibilidad para nuevas calculadoras
Se establece registro de modulos en `src/domain/calculators/`.

Cada calculadora define:
- id.
- nombre.
- descripcion.
- estado habilitada/deshabilitada.

Objetivo:
- Activar nuevas calculadoras sin reescribir routing, layout o SEO.

## 11) Performance
Requisitos base:
- Lazy load de rutas de blog.
- Lazy load de graficas.
- Minimizar impacto en bundle inicial.

## 12) Calidad y pruebas
Se mantienen pruebas unitarias de dominio/aplicacion como puerta minima.

Regla de aceptacion tecnica:
- Cualquier cambio de negocio exige actualizar o agregar pruebas.
