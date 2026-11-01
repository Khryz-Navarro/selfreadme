import { useEffect, useId, useState, type CSSProperties } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DEFAULT_THEME, THEME_PRESETS, applyTheme, loadTheme, normalizeHex, themeVars, type Mode, type Theme } from '@/lib/theme'

// Shared look for the mode and preset choices: native radios, styled through their label.
const choice = 'flex cursor-pointer items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm font-medium transition-colors '
  + 'hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-muted has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50'

/** The site theme picker: a nav tile that opens a panel. Changes apply live and are saved in this browser. */
export default function ThemePanel({ style }: { style?: CSSProperties }) {
  const [theme, setTheme] = useState<Theme>(loadTheme)
  const [hex, setHex] = useState(theme.accent)
  const accentId = useId()

  useEffect(() => applyTheme(theme), [theme])

  const pick = (next: Partial<Theme>) => setTheme(t => ({ ...t, ...next }))
  const choosePreset = (id: string, accent: string) => { pick({ preset: id, accent }); setHex(accent) }
  const chooseAccent = (value: string) => {
    setHex(value)
    const accent = normalizeHex(value)
    if (accent) pick({ accent, preset: THEME_PRESETS.find(p => p.accent === accent)?.id ?? 'custom' })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="tile link-tile theme-tile" style={style}>Theme</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">Site theme</DialogTitle>
          <DialogDescription>Choose how Selfreadme looks. It's saved in this browser and doesn't change your README.</DialogDescription>
        </DialogHeader>

        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-medium">Mode</legend>
          <div className="grid grid-cols-2 gap-2">
            {(['dark', 'light'] as Mode[]).map(mode => (
              <label key={mode} className={choice}>
                <input type="radio" name="theme-mode" className="sr-only" checked={theme.mode === mode} onChange={() => pick({ mode })} />
                {mode === 'dark' ? 'Dark' : 'Light'}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-medium">Colours</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {THEME_PRESETS.map(p => {
              const v = themeVars({ preset: p.id, accent: p.accent, mode: theme.mode })
              return (
                <label key={p.id} className={choice}>
                  <input type="radio" name="theme-preset" className="sr-only" checked={theme.preset === p.id} onChange={() => choosePreset(p.id, p.accent)} />
                  <span className="flex gap-0.5" aria-hidden="true">
                    {['--s1', '--s2', '--s3', '--s4'].map(k => <span key={k} className="size-3.5 rounded-[3px]" style={{ background: v[k] }} />)}
                  </span>
                  {p.name}
                </label>
              )
            })}
          </div>
        </fieldset>

        <div className="grid gap-1.5">
          <Label htmlFor={accentId}>Custom accent</Label>
          <div className="flex items-center gap-2">
            <input
              id={accentId} type="color" value={theme.accent} onChange={e => chooseAccent(e.target.value)}
              className="h-8 w-12 cursor-pointer rounded-lg border border-input bg-transparent p-0.5"
            />
            <Input aria-label="Custom accent as a hex code" className="w-28" value={hex} maxLength={7} spellCheck={false} onChange={e => chooseAccent(e.target.value)} />
          </div>
          {!normalizeHex(hex) && <p className="text-sm text-destructive">Use a six-digit hex colour, like #3b9eff.</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => { setTheme(DEFAULT_THEME); setHex(DEFAULT_THEME.accent) }}>Reset to default</Button>
          <DialogClose asChild><Button type="button">Done</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
