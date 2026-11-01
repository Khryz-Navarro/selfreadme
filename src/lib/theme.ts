// Site colour themes: a preset or custom accent, in dark or light mode. Every colour the page and the
// editor use is derived here and set as CSS variables, with each text colour chosen for contrast.

export type Mode = 'dark' | 'light'
export interface Theme { preset: string; accent: string; mode: Mode }

export const THEME_PRESETS = [
  { id: 'plum', name: 'Plum & pink', accent: '#ff488b' },
  { id: 'ocean', name: 'Ocean', accent: '#3b9eff' },
  { id: 'forest', name: 'Forest', accent: '#34c47c' },
  { id: 'sunset', name: 'Sunset', accent: '#ff8a3d' },
  { id: 'mono', name: 'Mono', accent: '#a1a1aa' },
]
export const DEFAULT_THEME: Theme = { preset: 'plum', accent: '#ff488b', mode: 'dark' }
export const THEME_KEY = 'selfreadme-theme'

// The original hand-tuned palette, kept exactly for the default theme.
const PLUM_DARK = {
  bg: '#0d060b', surface: '#1b0e17', s1: '#470c35', s2: '#7d1653', s3: '#c02a6e', empty: '#2c1826',
  popover: '#24121f', muted: '#2c1826', mutedInk: '#c9bfc6', line: '#3a2232', ink: '#ffffff', darkInk: '#0d060b', hover: '#ffffff',
}

/** "#rrggbb" for a six-digit hex colour (with or without "#"), otherwise null. */
export function normalizeHex(value: string) {
  const hex = value.trim().replace(/^#/, '')
  return /^[0-9a-fA-F]{6}$/.test(hex) ? `#${hex.toLowerCase()}` : null
}

const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
const toHex = (c: number[]) => `#${c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('')}`
/** Blends `b` into `a`; `t` is b's share. */
export const mix = (a: string, b: string, t: number) => { const B = rgb(b); return toHex(rgb(a).map((v, i) => v + (B[i] - v) * t)) }
const luminance = (hex: string) => {
  const [r, g, b] = rgb(hex).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
/** WCAG contrast ratio between two colours. */
export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** All CSS variables for a theme. Invalid accents fall back to the default one. */
export function themeVars(theme: Theme): Record<string, string> {
  const accent = normalizeHex(theme.accent) ?? DEFAULT_THEME.accent
  const dark = theme.mode !== 'light'
  const darkInk = mix(accent, '#050505', 0.94)
  let p: typeof PLUM_DARK
  if (dark && accent === DEFAULT_THEME.accent) {
    p = PLUM_DARK
  } else if (dark) {
    const bg = mix('#060606', accent, 0.05), surface = mix('#0b0b0b', accent, 0.1)
    p = {
      bg, surface, s1: mix(bg, accent, 0.28), s2: mix(bg, accent, 0.5), s3: mix(bg, accent, 0.76),
      empty: mix(surface, '#ffffff', 0.08), popover: mix(surface, '#ffffff', 0.04), muted: mix(surface, '#ffffff', 0.08),
      mutedInk: mix('#ffffff', bg, 0.22), line: mix(surface, '#ffffff', 0.14), ink: '#ffffff', darkInk, hover: '',
    }
  } else {
    const bg = mix('#ffffff', accent, 0.04), surface = mix('#ffffff', accent, 0.1)
    p = {
      bg, surface, s1: mix('#ffffff', accent, 0.22), s2: mix('#ffffff', accent, 0.45), s3: mix('#ffffff', accent, 0.72),
      empty: mix(surface, darkInk, 0.07), popover: mix('#ffffff', accent, 0.02), muted: mix(surface, darkInk, 0.05),
      mutedInk: mix(darkInk, bg, 0.3), line: mix(surface, darkInk, 0.16), ink: darkInk, darkInk, hover: '',
    }
  }
  // White or this theme's tinted near-black, whichever reads better; on mid-tones where neither reaches
  // 4.5:1, white or pure black (one of which always clears 4.58:1).
  const inkOn = (bg: string) => {
    const white = contrast(bg, '#ffffff'), tinted = contrast(bg, p.darkInk)
    if (Math.max(white, tinted) >= 4.5) return white >= tinted ? '#ffffff' : p.darkInk
    return contrast(bg, '#000000') > white ? '#000000' : '#ffffff'
  }
  const pinkInk = inkOn(accent)
  return {
    '--bg': p.bg, '--surface': p.surface, '--ink': p.ink,
    '--s0': p.surface, '--s1': p.s1, '--s2': p.s2, '--s3': p.s3, '--s4': accent, '--s-empty': p.empty,
    '--s1-ink': inkOn(p.s1), '--s2-ink': inkOn(p.s2), '--s3-ink': inkOn(p.s3),
    '--pink': accent, '--pink-ink': pinkInk, '--on-pink-ink': inkOn(pinkInk),
    // Hover moves the accent away from its text colour, so hovering never lowers contrast.
    '--pink-hover': p.hover || mix(accent, pinkInk === '#ffffff' ? '#000000' : '#ffffff', 0.25),
    '--popover-bg': p.popover, '--muted-bg': p.muted, '--muted-ink': p.mutedInk, '--line': p.line,
  }
}

/** The saved theme, or the default when nothing valid is stored. */
export function loadTheme(): Theme {
  try {
    const t = JSON.parse(localStorage.getItem(THEME_KEY) ?? 'null')
    const accent = t && normalizeHex(String(t.accent))
    if (accent && (t.mode === 'dark' || t.mode === 'light')) return { preset: typeof t.preset === 'string' ? t.preset : 'custom', accent, mode: t.mode }
  } catch { /* storage blocked or corrupt: use the default */ }
  return DEFAULT_THEME
}

/** Applies a theme to the page and saves it, with its variables, for the pre-render script in index.html. */
export function applyTheme(theme: Theme) {
  const root = document.documentElement
  const vars = themeVars(theme)
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v)
  root.classList.toggle('dark', theme.mode === 'dark')
  root.style.colorScheme = theme.mode
  try { localStorage.setItem(THEME_KEY, JSON.stringify({ ...theme, vars })) } catch { /* not saved: default next visit */ }
}
