import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DEFAULT_THEME, THEME_PRESETS, contrast, normalizeHex, themeVars, type Mode } from '../src/lib/theme.ts'

// Every text colour paired with the background it sits on somewhere on the page.
const PAIRS = [
  ['--ink', '--bg'], ['--ink', '--surface'], ['--s1-ink', '--s1'], ['--s2-ink', '--s2'], ['--s3-ink', '--s3'],
  ['--pink-ink', '--pink'], ['--pink-ink', '--pink-hover'], ['--on-pink-ink', '--pink-ink'], ['--muted-ink', '--bg'], ['--muted-ink', '--surface'],
]
const readable = (vars: Record<string, string>, label: string) => {
  for (const [fg, bg] of PAIRS) {
    const ratio = contrast(vars[fg], vars[bg])
    assert.ok(ratio >= 4.5, `${label}: ${fg} ${vars[fg]} on ${bg} ${vars[bg]} is ${ratio.toFixed(2)}:1`)
  }
}

test('the default theme keeps the original hand-tuned palette', () => {
  const v = themeVars(DEFAULT_THEME)
  assert.deepEqual(
    [v['--bg'], v['--surface'], v['--s1'], v['--s2'], v['--s3'], v['--s4'], v['--pink-ink'], v['--ink']],
    ['#0d060b', '#1b0e17', '#470c35', '#7d1653', '#c02a6e', '#ff488b', '#0d060b', '#ffffff'],
  )
  assert.equal(v['--s1-ink'], '#ffffff', 'tiles keep white text on plum')
})

test('every preset is readable in both modes', () => {
  for (const preset of THEME_PRESETS) for (const mode of ['dark', 'light'] as Mode[]) {
    readable(themeVars({ preset: preset.id, accent: preset.accent, mode }), `${preset.name} ${mode}`)
  }
})

test('any custom accent stays readable', () => {
  let seed = 11
  const next = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  for (let i = 0; i < 300; i++) {
    const accent = `#${Math.floor(next() * 0xffffff).toString(16).padStart(6, '0')}`
    for (const mode of ['dark', 'light'] as Mode[]) readable(themeVars({ preset: 'custom', accent, mode }), `${accent} ${mode}`)
  }
})

test('modes produce dark and light pages, and bad accents fall back', () => {
  const ocean = THEME_PRESETS[1].accent
  assert.ok(contrast(themeVars({ preset: 'ocean', accent: ocean, mode: 'dark' })['--bg'], '#000000') < 1.3, 'dark page is near black')
  assert.ok(contrast(themeVars({ preset: 'ocean', accent: ocean, mode: 'light' })['--bg'], '#ffffff') < 1.1, 'light page is near white')
  assert.equal(normalizeHex(' #3B9EFF '), '#3b9eff')
  for (const bad of ['blue', '#fff', '12345g', '']) assert.equal(normalizeHex(bad), null, bad)
  assert.equal(themeVars({ preset: 'custom', accent: 'nonsense', mode: 'dark' })['--pink'], DEFAULT_THEME.accent)
})
