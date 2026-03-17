# UI Design System – Finanzas claras

## Objetivo

Actualizar la UI de la aplicación para alinearla con el branding del logo.

La interfaz debe transmitir:

* confianza financiera
* claridad
* profesionalismo
* simplicidad

Evitar que la página parezca generada automáticamente con estilos por defecto.

No usar tipografías comunes como:

* Inter
* Roboto
* Open Sans
* Arial

---

# Paleta de Colores

Basada en el logo.

## Colores principales

Primary Blue
Usado para títulos, navbar, acciones principales.

```
#0F2A44
```

Secondary Blue

```
#1E4A72
```

Accent Green
Usado para resultados positivos, capital amortizado y highlights.

```
#2E9B6F
```

Light Green

```
#4CC38A
```

Accent Orange
Usado para insights o elementos de análisis.

```
#F5A623
```

Accent Yellow

```
#FFD166
```

---

## Colores neutros

Background

```
#F8FAFC
```

Surface (cards)

```
#FFFFFF
```

Text Primary

```
#0F172A
```

Text Secondary

```
#475569
```

Border

```
#E2E8F0
```

---

# Tipografía

Para evitar apariencia genérica de AI:

## Tipografía principal

**Plus Jakarta Sans**

Motivo:

* moderna
* fintech
* profesional
* poco usada en plantillas genéricas

Google Font:

```
Plus Jakarta Sans
```

Pesos recomendados:

```
400
500
600
700
```

---

## Tipografía secundaria (opcional para números)

**IBM Plex Sans**

Motivo:

* excelente para números financieros
* muy legible en tablas

---

# Jerarquía Tipográfica

H1

```
font-size: 36px
font-weight: 700
color: Primary Blue
```

H2

```
font-size: 28px
font-weight: 600
```

H3

```
font-size: 22px
font-weight: 600
```

Body

```
font-size: 16px
font-weight: 400
color: Text Primary
```

Small

```
font-size: 14px
color: Text Secondary
```

---

# Componentes UI

## Navbar

Background

```
white
```

Border bottom

```
1px solid #E2E8F0
```

Logo text

```
Primary Blue
font-weight: 700
```

CTA button

```
background: #2E9B6F
color: white
border-radius: 10px
padding: 10px 16px
```

Hover

```
background: #27875F
```

---

# Botones

Primary

```
background: #2E9B6F
color: white
border-radius: 10px
padding: 10px 16px
font-weight: 600
```

Hover

```
#27875F
```

Secondary

```
background: white
border: 1px solid #E2E8F0
```

---

# Cards

Background

```
white
```

Border

```
1px solid #E2E8F0
```

Border radius

```
12px
```

Shadow

```
0 4px 12px rgba(0,0,0,0.05)
```

Padding

```
24px
```

---

# Tablas financieras

Header background

```
#F1F5F9
```

Row hover

```
#F8FAFC
```

Capital column

```
color: #2E9B6F
```

Interest column

```
color: #F5A623
```

---

# Gráficas (Recharts)

Saldo restante

```
#1E4A72
```

Capital pagado

```
#2E9B6F
```

Intereses

```
#F5A623
```

Grid lines

```
#E2E8F0
```

---

# Configuración Tailwind

Actualizar `tailwind.config.ts`.

```ts
theme: {
  extend: {
    colors: {
      primary: "#0F2A44",
      primaryLight: "#1E4A72",
      accentGreen: "#2E9B6F",
      accentGreenLight: "#4CC38A",
      accentOrange: "#F5A623",
      accentYellow: "#FFD166",
      background: "#F8FAFC",
      surface: "#FFFFFF",
      textPrimary: "#0F172A",
      textSecondary: "#475569",
      border: "#E2E8F0"
    },
    fontFamily: {
      sans: ["Plus Jakarta Sans", "sans-serif"]
    }
  }
}
```

---

# Estilo General

La interfaz debe parecer:

* fintech
* profesional
* limpia
* enfocada en datos

Evitar:

* colores saturados
* sombras exageradas
* gradientes fuertes
* estilos tipo landing de marketing.

Priorizar:

* claridad de números
* lectura rápida
* confianza.
