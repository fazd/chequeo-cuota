# Finanzas claras - Arquitectura V2 para Escalar Calculadoras

## Estado del documento

- Estado: Propuesto (no implementado).
- Alcance: Definir arquitectura y plan de migracion para reducir repeticion al crear nuevas calculadoras.
- Objetivo operativo: Que una nueva calculadora se integre sin tocar manualmente routing, navbar, SEO, sitemap ni estructura base de UI.

---

## 1) Problema actual

Hoy existe buena base por capas (`domain`, `application`, `presentation`), pero la incorporacion de nuevas calculadoras todavia exige repetir pasos y decisiones en varios puntos:

- Rutas y navegacion registradas manualmente en varios archivos.
- Metadata SEO y sitemap gestionados por separado.
- Plantillas de pagina de calculadoras repetidas.
- Logica duplicada entre modulos con comportamiento similar (ej: vehicular/libranza).
- Secciones de UI reusables parciales, pero sin un contrato declarativo unico.

Impacto:

- Alto costo de mantenimiento.
- Riesgo de inconsistencias entre calculadoras.
- Necesidad frecuente de re-recordar instrucciones ya definidas en AGENTS/design docs.

---

## 2) Principios de diseno (alineados con AGENTS.md)

Esta propuesta mantiene y refuerza los principios vigentes:

- Frontend-only, stateless, sin autenticacion, sin persistencia financiera.
- Separacion por capas estricta.
- Precision financiera: sin redondeo interno, redondeo solo en presentacion/exportacion.
- Reuso obligatorio de componentes compartidos para dinero, aportes, seguros y graficas.
- Regla visual: ocultar metricas/series/columnas que sean siempre 0 cuando aplique.

Adicionalmente, define principios de escalabilidad:

- Source of truth unico para registro de calculadoras.
- Configuracion declarativa sobre codificacion repetitiva.
- Generacion automatica de artefactos derivados (routing, SEO tecnico, sitemap).
- Guardrails automatizados para proteger arquitectura.

---

## 3) Objetivo de arquitectura V2

Pasar de una arquitectura "pagina por pagina" a una arquitectura "modulo + manifest + adapters".

Resultado esperado:

- Crear nueva calculadora agregando:
  1. Modulo de dominio.
  2. Modulo de aplicacion (adapter).
  3. Config de manifest.
  4. Tests.
- El resto (ruta, nav, home cards, SEO baseline, sitemap) se deriva automaticamente.

---

## 4) Arquitectura objetivo

## 4.1 Calculator Manifest (fuente unica de verdad)

Crear un manifest tipado central en `src/domain/calculators/` con:

- `id`
- `path`
- `enabled`
- `nav` (si aparece en navbar y orden)
- `homeCard` (titulo, descripcion, icono)
- `seo` (title, description, canonical path, ogType)
- `pageKind` (`single-loan`, `credit-card-portfolio`, etc)
- `blogSuggestions` (slugs sugeridos por calculadora)

Regla:

- Ninguna ruta/entrada de SEO de calculadora se define fuera del manifest, salvo paginas institucionales y blog.

---

## 4.2 Router y navegacion derivados

Refactor de `AppRouter` y `Navbar` para construir rutas y links desde manifest:

- `AppRouter`: monta rutas de calculadoras habilitadas leyendo `manifest`.
- `Navbar`: muestra solo calculadoras habilitadas con `nav.visible`.
- Home: usa `homeCard` del manifest para activas/proximas.

Beneficio:

- Evita divergencias entre registry, navbar y router.

---

## 4.3 SEO y sitemap derivados

Centralizar SEO baseline de calculadoras desde manifest:

- `title`
- `description`
- `canonical`
- `og`

Generar `sitemap.xml` automaticamente en build desde:

- rutas estaticas institucionales
- rutas de calculadoras habilitadas (manifest)
- slugs de blog (`src/content/blog/*.mdx`)

Regla:

- `public/sitemap.xml` manual deja de ser fuente primaria.

---

## 4.4 Application Adapter por calculadora

Definir contrato comun de adapter en `src/application/calculators/`:

```ts
export interface CalculatorAdapter<TInput, TProjection, TSummary> {
  id: string
  calculate(input: TInput): TProjection
  buildSummary(projection: TProjection): TSummary
  trackCalculate(): void
}
```

Para cada calculadora:

- Se implementa adapter especifico en `application/<calculator>/`.
- Se registra en un `calculatorAdapterRegistry`.

Beneficio:

- Estandariza flujo de calculo y resumen.
- Reduce diferencias accidentales entre paginas.

---

## 4.5 BaseCalculatorPage y schemas de UI

Introducir capa de presentacion declarativa:

- `BaseCalculatorPage` (layout comun: hero, form, resumen, charts, tabla, csv, bloque de aprendizaje).
- Schemas por calculadora:
  - `formSchema`
  - `summarySchema`
  - `chartSchema`
  - `tableSchema`

Reglas compartidas:

- `hideWhenAllZero` para metricas/series/columnas.
- `MoneyInput` obligatorio en campos monetarios.
- Bloques `ExtraPaymentsCard` y `InsuranceCard` como componentes base parametrizables.
- Tooltips mobile y comportamiento de blur en scroll definidos una sola vez.

Nota:

- TC puede mantener variante especializada (`portfolio`), pero usando los mismos primitives base de charts/metrics/tables.

---

## 4.6 Guardrails de arquitectura

Agregar controles automatizados:

- Lint boundaries:
  - `domain` no puede importar React.
  - `application` no puede importar React ni `presentation`.
- Check de manifest:
  - ids unicos
  - paths unicos
  - metadatos SEO obligatorios
- Check de contenido:
  - frontmatter requerido en blog
  - slugs unicos

---

## 4.7 Scaffolder de nueva calculadora

Agregar comando:

```bash
npm run gen:calculator -- --id consumo
```

Genera:

- `domain/<id>/loan.types.ts`
- `domain/<id>/simulator.ts`
- `domain/<id>/simulator.test.ts`
- `application/<id>/calculateProjection.ts`
- `application/<id>/summary.ts`
- `application/<id>/calculateProjection.test.ts`
- `presentation/pages/<Id>CalculatorPage.tsx` (si aplica)
- Registro en manifest (con TODOs guiados)

Beneficio:

- Evita olvidar pasos operativos repetitivos.

---

## 5) Modelo de carpetas objetivo (referencial)

```text
src/
  domain/
    calculators/
      manifest.ts
      types.ts
    hipotecario/
    vehicular/
    libranza/
    tc/
  application/
    calculators/
      adapter.types.ts
      adapterRegistry.ts
    hipotecario/
    vehicular/
    libranza/
    tc/
  presentation/
    calculators/
      base/
        BaseCalculatorPage.tsx
        schemas.ts
      builders/
        buildForm.tsx
        buildSummary.tsx
        buildCharts.tsx
        buildTable.tsx
    components/
      shared/
        MoneyInput.tsx
        InsuranceCard.tsx
        ExtraPaymentsCard.tsx
        FinancialChartsPanel.tsx
```

---

## 6) Plan de migracion por fases

## Fase 1 - Fuente unica de verdad

Objetivo:

- Introducir manifest V2.
- Derivar navbar/home/router para calculadoras desde manifest.

Entregables:

- Manifest tipado.
- Adaptacion de `AppRouter`, `Navbar`, `Home`.
- Tests de rutas y visibilidad.

Riesgo:

- Romper rutas actuales.

Mitigacion:

- Mantener alias/redirects donde aplique.

---

## Fase 2 - SEO y sitemap automatizados

Objetivo:

- Mover SEO de calculadoras al manifest.
- Generar sitemap desde contenido real.

Entregables:

- Builder de SEO por ruta.
- Script build-time para sitemap.
- Validacion de canonicals.

Riesgo:

- Inconsistencias temporales en indexacion.

Mitigacion:

- Comparar sitemap antiguo vs generado antes de activar.

---

## Fase 3 - Factory de paginas y schemas

Objetivo:

- Crear `BaseCalculatorPage`.
- Migrar hipotecario, vehicular y libranza a esquema comun.

Entregables:

- UI declarativa de form/resumen/charts/table.
- Eliminacion de duplicacion entre pages similares.

Riesgo:

- Regresiones visuales.

Mitigacion:

- Tests de UI por snapshot minimo + pruebas de interaccion clave.

---

## Fase 4 - TC sobre primitives compartidos

Objetivo:

- Extraer partes del page monolitico de TC a hooks/componentes base.
- Consolidado usando base compartida de charts.

Entregables:

- `useCreditCardTabs`, `useCreditCardPortfolio`, `useCreditCardValidation`.
- Reuso de `FinancialChartsPanel` tambien en consolidado.

Riesgo:

- Complejidad alta por casos de TC.

Mitigacion:

- Migracion incremental por bloques (tabs, form, consolidado, modal).

---

## Fase 5 - Tooling y governance

Objetivo:

- Scaffolder + lint boundaries + checklist de PR obligatoria.

Entregables:

- `gen:calculator`.
- Reglas lint/arquitectura.
- Plantilla PR con checks de negocio y arquitectura.

---

## 7) Criterios de aceptacion V2

Se considera cumplido cuando:

- Alta de calculadora nueva sin tocar manualmente:
  - router
  - navbar
  - SEO baseline
  - sitemap
- Todos los campos monetarios usan `MoneyInput` (o wrapper equivalente comun).
- Todas las graficas usan base compartida de panel/tooltip mobile.
- Ningun archivo de `domain/application` importa React.
- Se mantiene cobertura minima de pruebas en domain/application.

---

## 8) Checklists operativos

## 8.1 Checklist "Nueva calculadora"

1. Crear modulo de dominio y tests.
2. Crear adapter de aplicacion y tests.
3. Registrar calculadora en manifest.
4. Definir schema de UI (form/resumen/charts/table).
5. Validar SEO generado.
6. Validar ruta renderizada y card en Home/Nav.
7. Verificar ocultamiento de metricas/series en cero.
8. Ejecutar suite de pruebas.

## 8.2 Checklist "Cambio de negocio"

1. Test Red (falla).
2. Implementacion Green.
3. Refactor.
4. Actualizar docs de arquitectura (AGENTS + design docs) si cambia decision vigente.

---

## 9) Metrica de exito

Medir antes/despues:

- Tiempo de alta de calculadora (horas efectivas).
- Cantidad de archivos tocados por calculadora nueva.
- Defectos por inconsistencias de routing/SEO/UI compartida.
- Porcentaje de codigo duplicado entre modulos similares.

Objetivo inicial:

- Reducir en al menos 40% los archivos necesarios para alta de una calculadora.

---

## 10) Decisiones abiertas a confirmar

1. Mantener rutas explicitas (`/amortizacion-credito-...`) o migrar a ruta parametrica (`/calculadora/:id`)?
2. `como-funciona` se mantiene obligatorio en la arquitectura objetivo?
3. Sitemap se genera en build local, CI o ambos?
4. El primer alcance de `gen:calculator` incluye pagina UI completa o solo dominio/aplicacion + manifest?

---

## 11) Fuera de alcance de esta propuesta

- Backend o persistencia.
- Login/autenticacion.
- Redefinir reglas financieras de negocio actuales.
- Cambiar politicas de privacidad/analytics (solo se ordena su integracion).

---

## 12) Resumen ejecutivo

La V2 propone pasar de integraciones manuales por calculadora a una arquitectura declarativa con manifest + adapters + base page + tooling.

Esto elimina repeticion operativa, baja riesgo de inconsistencias, y formaliza una forma unica de crecer sin perder lineamientos de AGENTS y documentos de diseno.
