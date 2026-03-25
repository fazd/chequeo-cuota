# Plan UI Landing Page v2 - Finanzas claras

## 1) Contexto
Feedback recibido:
- Hay demasiado texto en la landing.
- No existe una jerarquia clara entre bloques.

Estado actual (Home):
- Hero + subtitulo largo.
- Bloques "Como te ayudamos", "Prueba", "Proximamente", "FAQ".
- Todos los bloques compiten con peso visual similar.

## 2) Objetivo de la nueva landing
- Reducir carga cognitiva en el primer scroll.
- Definir una ruta clara: entender valor -> elegir calculadora -> avanzar.
- Mejorar escaneabilidad en mobile y desktop.
- Mantener coherencia con SEO, design system y reglas de privacidad del proyecto.

## 3) Principios de diseno (obligatorios)
1. Un mensaje principal por bloque.
2. Titulos cortos (max 8 palabras).
3. Parrafos cortos (max 2 lineas en desktop, 3 en mobile).
4. Priorizar listas y cards sobre parrafos largos.
5. Un CTA primario visible above the fold.
6. Jerarquia tipografica estricta (H1 > H2 > body > caption).

## 4) Nueva arquitectura de contenido (orden de secciones)
1. Hero (propuesta de valor + CTA primario)
2. Calculadoras activas (accion inmediata)
3. Como funciona (3 pasos)
4. Bloque confianza y privacidad (sin guardar datos)
5. FAQ compacto (acordeon, 3-5 preguntas max)
6. CTA final de cierre

Nota:
- "Proximamente" pasa a formato compacto (badge o mini listado) para no competir con el objetivo principal.
- El blog no debe robar foco en la landing; se deja como acceso secundario desde navbar/footer o bloque pequeno.

## 5) Copy framework por bloque (para reducir texto)
### Hero
- H1: 5-8 palabras.
- Subtitulo: 1 frase (max 16 palabras).
- CTA primario: "Ir a la calculadora".
- CTA secundario opcional: "Como funciona".

### Calculadoras activas
- Card: titulo + descripcion de 1 linea + accion.
- Evitar descripciones largas de producto.
- Mostrar maximo 3 cards sin scroll horizontal.

### Como funciona
- 3 pasos cortos:
  1) Ingresa datos.
  2) Compara cuota y proyeccion.
  3) Toma una mejor decision.

### Confianza/privacidad
- 2 mensajes puntuales:
  - "Sin login".
  - "Tus datos no se guardan".

### FAQ
- 3 a 5 preguntas maximo.
- Respuestas de 1-2 lineas.

## 6) Jerarquia visual y layout
### Escala tipografica sugerida
- H1: 40/48 desktop, 30/36 mobile.
- H2: 28/34 desktop, 22/28 mobile.
- Body: 16/26.
- Caption/meta: 14/20.

### Espaciado vertical
- Secciones: 72-96 px desktop, 48-64 px mobile.
- Dentro de seccion: 16-24 px entre titulo y contenido.

### Contraste y foco
- CTA primario con color accent (verde) y alto contraste.
- CTA secundarios con estilo neutral (outline o texto).
- Cards con contraste suave, sin sombras agresivas.

## 7) Reglas mobile-first
- Hero con CTA visible sin scroll en la mayoria de pantallas.
- Titulos y textos con wrap limpio (sin bloques densos).
- Grid de calculadoras pasa a 1 columna.
- FAQ en acordeon para reducir longitud total de pagina.

## 8) Plan de implementacion
1. Auditoria de copy actual
   - Recortar o reescribir textos por bloque.
   - Eliminar duplicidad entre "Como te ayudamos" y hero.
2. Wireframe de baja fidelidad
   - Definir jerarquia visual y orden final.
3. Ajustes UI en `Home.tsx` y estilos
   - Reordenar secciones.
   - Introducir CTA primario claro.
   - Compactar FAQ y "Proximamente".
4. QA responsive + SEO
   - Verificar escaneabilidad mobile.
   - Verificar H1 unico, metadatos y enlaces internos.
5. Medicion post-lanzamiento
   - Monitorear CTR a calculadoras y rebote de landing.

## 9) Criterios de aceptacion
- El usuario entiende propuesta de valor en menos de 5 segundos.
- Existe CTA primario visible sin scroll.
- Ninguna seccion supera 2-3 lineas de texto continuo en mobile.
- Se percibe jerarquia visual clara entre hero, accion principal y soporte.
- "Proximamente" no compite visualmente con calculadoras activas.

## 10) Riesgos y mitigacion
- Riesgo: simplificar demasiado y perder contexto educativo.
  - Mitigacion: mover detalle a "Como funciona" y blog, no al hero.
- Riesgo: exceso de bloques visuales.
  - Mitigacion: limitar secciones a 5-6 y usar patrones repetibles.
- Riesgo: degradar SEO por recorte de texto.
  - Mitigacion: mantener titulos semanticos, FAQ breve y enlaces internos.
