---
trigger: always_on
glob: "**/*.{ts,tsx,css}"
description: "Rules for the AutomateAI Design System - Clean, Corporate, Professional"
---

# AutomateAI Design System

## Core Principles

1.  **Professional & Clean**: Avoid "gamified" or "noisy" elements (particles, excessive floating orbs). Focus on a corporate, high-end SaaS aesthetic.
2.  **Typography First**: Use clear, legible typography (Geist Sans / Inter). meaningful headings, and good contrast.
3.  **Subtle Depth**: Use subtle shadows (`shadow-sm`, `shadow-md`) and borders (`border-zinc-200`/`border-zinc-800`) to define hierarchy, rather than heavy colors.
4.  **Branding**:
    - **Name**: AutomateAI - Excelência em gestão e automação.
    - **Logo**: Scissors icon (lucide-react) for now.
    - **Palette**: Neutral Grays/Zinc for structure. Primary action color should be distinct but professional (e.g., Black/White or a deep Brand Color).

## Component Guidelines

### Layouts

- **Dashboard**: Sidebar (Left) + Header (Top) + Content (Main).
- **Backgrounds**:
  - **Login/Landing**: Rich, dark gradients with subtle noise texture.
  - **App Content**: Clean light (or dark) backgrounds for maximum readability of data. Avoid heavy textures behind data tables.

### Cards & Containers

- Use `rounded-xl` or `rounded-lg`.
- `border border-border` is preferred over heavy shadows for layout sections.
- `bg-card` (White/Zinc-950) for content areas.

### Inputs & Forms

- Clean, standard height (`h-10` or `h-11`).
- `focus:ring-2` with a subtle offset.

### Branding

- Always use "AutomateAI" when referring to the system name.
- Footer copyright: "© [Year] AutomateAI - Excelência em gestão e automação."
