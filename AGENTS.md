# AGENTS.md - Decisiones de Arquitectura

## Objetivo del documento
Este archivo resume las decisiones arquitectonicas vigentes del proyecto `finanzas claras` para guiar trabajo futuro de agentes y desarrolladores.

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
- En tablas de amortizacion de todas las calculadoras, ocultar columnas opcionales cuando todos sus valores absolutos esten por debajo de una delta pequena (epsilon), para evitar columnas visuales llenas de 0.
- Al hacer scroll en mobile, cerrar teclado (blur del input activo).
- No cerrar el teclado inmediatamente tras enfocar; solo cerrar en scroll real del usuario.

## 15) Regla de mantenimiento de AGENTS.md
Siempre actualizar este documento despues de:
- Arreglar errores o inconsistencias funcionales.
- Analizar nuevos documentos de diseño o arquitectura.

## 16) Tarjetas de credito (estado actual)
Se activa una nueva calculadora en:
- `/calculadora-tarjeta-credito`.

Decision de UX:
- Maximo 5 tarjetas.
- PestaÃ±as por tarjeta.
- El tab `Consolidado` solo aparece con 2 o mas tarjetas.
- Cada tarjeta muestra sus propias graficas.
- El nombre de tarjeta se edita inline en el tab; no hay campo `Nombre` separado en el formulario.
- Los nombres de tarjetas deben ser unicos. Si el nombre ya existe, mostrar warning y bloquear el cambio.
- El tipo de tasa por tarjeta usa radio buttons con el patron visual de las otras calculadoras.
- Seguros y aportes extra por tarjeta se habilitan con controles coherentes al design system compartido.
- Las acciones de tarjeta (renombrar, eliminar, agregar) viven en el area de tabs/nombre para evitar campos duplicados.
- Todo campo monetario en TC debe usar el mismo formato visual de dinero del proyecto (`$` + separador de miles) y no `input number` simple.
- Reutilizar componentes y helpers compartidos de formularios (ej: `MoneyInput`) en lugar de crear campos desde cero por calculadora.
- El bloque de "Aportes adicionales" debe implementarse con componente reutilizable compartido entre calculadoras (periodico + extraordinario), evitando forks por pagina.
- El bloque de "Seguros" debe implementarse con componente reutilizable compartido entre calculadoras; parametrizar variantes (fijo/variable) sin duplicar UI por pagina.
- Las graficas deben construirse sobre una base reutilizable compartida (layout, tooltip mobile, ejes y leyenda) y cada calculadora solo define series/datos.
- Eliminar tarjeta requiere modal de confirmacion antes de borrar el tab.
- Aportes mensuales se muestran en card dedicada de "Aportes adicionales" dentro de la tarjeta activa.
- Si el valor de seguros es 0, la card/metrica de seguros NO debe mostrarse en resumen de tarjeta ni consolidado.
- Regla global de seguros (todas las calculadoras): si hay seguro (>0), mostrar siempre ambas cards `Total seguros` y `% seguros`; si el seguro es 0, ocultar ambas.
- Regla general de visualizacion: si una metrica/columna/serie grafica es siempre 0 en el escenario actual, NO debe mostrarse.
- En tabla de amortizacion TC, ocultar columnas de cuota de manejo y/o seguro cuando su valor es 0 en todas las filas.
- En tabla de amortizacion TC, ocultar columna `Aporte` cuando todos los meses tienen aporte 0.
- En simulador TC, normalizar a 0 los `extraPayment` con magnitud menor al epsilon para evitar ruido por precision flotante.
- En resumen de TC, `Cupo usado` se calcula sobre deuda inicial vs cupo y `Cupo liberado` como reduccion acumulada de deuda (deuda inicial - deuda final), no usando solo el ultimo mes.
- En tarjetas de metricas (cards-grid) los valores monetarios deben mostrarse sin decimales para mejorar legibilidad en montos grandes.
- En resumen TC (individual y consolidado), mostrar al final porcentajes de composicion: `% intereses`, `% deuda total`, `% cuota manejo` y `% seguros` (los dos ultimos solo si aplican).
- En TC por tarjeta, si los aportes generan ahorro de intereses y/o reduccion de plazo, mostrar mensaje tipo `savings-summary` igual al patron de las otras calculadoras.

Motor TC:
- Simulacion mensual por tarjeta con:
  - deuda inicial.
  - plazo en meses (`termMonths`) obligatorio.
  - tasa (EA o nominal vencida).
  - pago minimo opcional (si se omite, se calcula automaticamente con deuda+tasa+plazo).
  - cuota de manejo opcional.
  - seguro opcional.
  - cupo opcional.
- Se permite deuda creciente cuando el pago minimo no cubre cargos y se informa alerta.
- Comparacion de cuota minima:
  - siempre calcular cuota minima teorica.
  - si usuario ingresa cuota minima reportada, mostrar comparacion teorica vs reportada.
  - si la diferencia relativa supera 1%, mostrar alerta.
- Consolidado soporta aportes globales:
  - manual por tarjeta.
  - automatico por estrategia.

Estrategias de pago:
- Bola de nieve: menor deuda primero.
- Optimizacion: mayor costo efectivo mensual (tasa + penalizacion por cargos fijos).

Calidad:
- Se agregan pruebas unitarias para dominio TC y aplicacion de consolidado/estrategias.
- Politica vigente: cambios de negocio deben mantener enfoque TDD y pruebas de regresion.

## 17) Plan de escalabilidad V2 (estado actual)
Se documenta una propuesta de arquitectura para reducir repeticion al crear nuevas calculadoras en:

- `design_documents/calculadoras_v2_arquitectura.md`

Estado:
- Implementacion parcial iniciada.
- Fuente unica de calculadoras basada en manifest (`src/domain/calculators/manifest.json` + `manifest.ts`).
- Routing de calculadoras, Home, Navbar y SEO de calculadoras consumen el manifest.
- `sitemap.xml` se genera automaticamente desde manifest + blog MDX con `npm run generate:sitemap` (ejecutado en `build`).
- Pendiente por fases posteriores: adapter/factory de paginas, schemas UI y scaffolder de nuevas calculadoras.

## 18) Plan UI Landing Page (design_documents/landingpage.md)
Decision vigente:
- La landing se rediseña con enfoque en jerarquia visual y reduccion de texto.
- Orden canonico de bloques: Hero -> Calculadoras activas -> Como funciona -> Confianza/privacidad -> FAQ compacto -> CTA final.
- "Proximamente" pasa a formato secundario para no competir con la accion principal.
- El plan de referencia para ejecucion es `design_documents/landingpage.md`.
- Implementacion mobile-first obligatoria:
  - CTA principal visible en primer bloque y tocable en mobile.
  - Grids de landing degradan a 1 columna en pantallas pequenas.
  - FAQ compacto en acordeon para reducir altura y mejorar escaneo.
