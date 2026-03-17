# AGENTS.md - Decisiones de Arquitectura

## Objetivo del documento
Este archivo resume las decisiones arquitectonicas vigentes del proyecto `chequeo-cuota` para guiar trabajo futuro de agentes y desarrolladores.

## 1) Vision de producto y alcance
El proyecto evoluciona de una calculadora unica a una plataforma educativa financiera llamada **Finanzas claras**.

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

## 13) UI Design System (ui-diseño.md)
Resumen obligatorio:
- Tipografia principal: Plus Jakarta Sans. Evitar fuentes genericas (Inter/Roboto/Open Sans/Arial).
- Tipografia secundaria opcional para numeros: IBM Plex Sans.
- Paleta basada en el logo (Primary #0F2A44, Secondary #1E4A72, Accent Green #2E9B6F, Accent Orange #F5A623, neutrales #F8FAFC/#FFFFFF/#E2E8F0).
- Estilo: fintech, profesional, limpio y centrado en datos. Evitar sombras exageradas, gradientes fuertes y look generico.
- Graficas Recharts: Saldo #1E4A72, Capital #2E9B6F, Interes #F5A623, grid #E2E8F0.

## 14) Mobile UX (graficas e inputs)
Reglas de comportamiento:
- Tooltips de graficas en mobile deben ser compactos, dentro del contenedor (bandas) y con maximo 2–3 lineas.
- Nunca usar tooltip tipo modal o full-screen en mobile.
- El tooltip no debe salirse del viewport; permitir wrap y limitar ancho.
- Al perder foco (tap fuera/scroll), el tooltip debe desaparecer.
- Eje X y leyenda deben reservar espacio para evitar superposicion en mobile.
- Series condicionadas: si no hay aportes, solo una linea; si no hay seguros, no mostrar barra de seguros.
- Al hacer scroll en mobile, cerrar teclado (blur del input activo).
- No cerrar el teclado inmediatamente tras enfocar; solo cerrar en scroll real del usuario.

## 15) Regla de mantenimiento de AGENTS.md
Siempre actualizar este documento despues de:
- Arreglar errores o inconsistencias funcionales.
- Analizar nuevos documentos de diseño o arquitectura.
