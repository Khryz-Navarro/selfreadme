import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { marked } from 'marked'
import { Check, Copy, Download, RotateCcw } from 'lucide-react'
import markdownCss from 'github-markdown-css/github-markdown.css?raw'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ListEditor, MoveButtons, SelectField, TextField, move } from '@/components/fields'
import {
  LEGACY_STORAGE_KEY, PRESETS, SNAKE_WORKFLOW, SOCIALS, STORAGE_KEY, defaultProfile, generateReadme, githubUser, mergeProfile,
  type BadgeStyle, type Certificate, type Job, type Profile, type Project, type SectionKey, type Skill, type Social,
} from '@/lib/readme'


function load(): Profile {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY) ?? 'null')
    if (saved) return mergeProfile(saved)
  } catch { /* storage blocked or corrupt: start from defaults */ }
  return defaultProfile()
}

// The profile shared by the landing page's hero and the editor, saved in this browser.
export function useProfile() {
  const [p, setP] = useState(load)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)) } catch { /* private mode: nothing to persist */ }
  }, [p])
  return [p, setP] as const
}

// The README renders in its own document, as on GitHub: its headings and styles stay out of the page,
// and the sandbox blocks any script in the user's HTML.
const PREVIEW_SHELL = `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>${markdownCss}
body { box-sizing: border-box; min-height: 100%; margin: 0; padding: 24px; }</style></head><body class="markdown-body"></body></html>`

function ReadmePreview({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [ready, setReady] = useState(false)
  // Swapping the body instead of the whole document keeps the scroll position while typing.
  useEffect(() => {
    const body = ref.current?.contentDocument?.body
    if (ready && body) body.innerHTML = html
  }, [html, ready])
  return (
    <iframe
      ref={ref} title="README preview" srcDoc={PREVIEW_SHELL} onLoad={() => setReady(true)}
      sandbox="allow-same-origin allow-popups" className="block h-[calc(100svh-9rem)] min-h-96 w-full"
    />
  )
}

function downloadFile(name: string, text: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

const SECTION_NAMES: Record<SectionKey, string> = {
  intro: 'Introduction', skills: 'Tech stack', projects: 'Projects', experience: 'Work experience',
  certificates: 'Certificates', socials: 'Socials', snake: 'Snake', views: 'Profile views',
}

const INTRO_FIELDS: [keyof Profile['intro'], string, string?][] = [
  ['name', 'Name'], ['title', 'Headline'], ['location', 'Based in'], ['working', 'Currently working on'],
  ['learning', 'Currently learning'], ['askMe', 'Ask me about'], ['funFact', 'Fun fact'],
  ['avatar', 'Avatar or banner image URL', 'https://…'],
]

const SOCIAL_OPTIONS = Object.entries(SOCIALS).map(([k, [label]]) => [k, label] as [string, string])

export default function Editor({ p, setP }: { p: Profile; setP: Dispatch<SetStateAction<Profile>> }) {
  const [copied, setCopied] = useState<string | null>(null)
  const md = useMemo(() => generateReadme(p), [p])
  const html = useMemo(() => marked.parse(md, { async: false }), [md])

  const patch = <K extends keyof Profile>(key: K, value: Profile[K]) => setP(prev => ({ ...prev, [key]: value }))
  const setSettings = (s: Partial<Profile['settings']>) => patch('settings', { ...p.settings, ...s })

  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }
  const snakeUser = githubUser(p)
  const toggleSkill = ([name, logo, color]: [string, string, string]) =>
    patch('skills', p.skills.some(s => s.name === name) ? p.skills.filter(s => s.name !== name) : [...p.skills, { name, logo, color }])

  return (
    <div className="bg-background text-foreground">
      <div className="flex flex-wrap items-end gap-3 pb-6">
        <div className="mr-auto">
          <h2 id="editor-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">Build your README</h2>
          <p className="mt-2 text-muted-foreground">Fill in what you want to show. Everything saves in this browser as you type.</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost"><RotateCcw /> Reset</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold tracking-tight">Start over with the example profile?</AlertDialogTitle>
              <AlertDialogDescription>
                Everything you've entered in this browser is replaced: your intro, badges, projects, links and layout. This can't be undone, so copy or download your README first if you want to keep it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep my profile</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={() => setP(defaultProfile())}>
                Reset everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button variant="outline" onClick={() => copy('md', md)}>{copied === 'md' ? <Check /> : <Copy />} {copied === 'md' ? 'Copied' : 'Copy markdown'}</Button>
        <Button onClick={() => downloadFile('README.md', md)}><Download /> Download README.md</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Accordion type="multiple" defaultValue={['intro']} className="min-w-0" data-ui>
          <AccordionItem value="layout">
            <AccordionTrigger>Layout & style</AccordionTrigger>
            <AccordionContent><div className="p-1 grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField
                  label="Badge style" value={p.settings.badgeStyle} onChange={v => setSettings({ badgeStyle: v as BadgeStyle })}
                  options={[['for-the-badge', 'For the badge'], ['flat', 'Flat'], ['flat-square', 'Flat square'], ['plastic', 'Plastic'], ['social', 'Social']]}
                />
                <SelectField
                  label="Alignment" value={p.settings.align} onChange={v => setSettings({ align: v as 'center' | 'left' })}
                  options={[['center', 'Centered'], ['left', 'Left']]}
                />
              </div>
              <p className="text-sm text-muted-foreground">Turn sections on or off, rename their headings and change their order.</p>
              <div className="grid gap-2">
                {p.settings.order.map((key, i) => (
                  <div key={key} className="flex items-center gap-2">
                    <Switch
                      aria-label={`Show ${SECTION_NAMES[key]}`} checked={p.settings.enabled[key]}
                      onCheckedChange={on => setSettings({ enabled: { ...p.settings.enabled, [key]: on } })}
                    />
                    <span className="w-32 shrink-0 text-sm">{SECTION_NAMES[key]}</span>
                    <Input
                      aria-label={`${SECTION_NAMES[key]} heading`} value={p.settings.titles[key]}
                      onChange={e => setSettings({ titles: { ...p.settings.titles, [key]: e.target.value } })}
                    />
                    <MoveButtons
                      index={i} count={p.settings.order.length} label={SECTION_NAMES[key]}
                      onMove={d => setSettings({ order: move(p.settings.order, i, d) })}
                    />
                  </div>
                ))}
              </div>
            </div></AccordionContent>
          </AccordionItem>

          <AccordionItem value="intro">
            <AccordionTrigger>Introduction</AccordionTrigger>
            <AccordionContent><div className="p-1 grid gap-3 sm:grid-cols-2">
              {INTRO_FIELDS.map(([key, label, placeholder]) => (
                <TextField key={key} label={label} placeholder={placeholder} value={p.intro[key]} onChange={v => patch('intro', { ...p.intro, [key]: v })} />
              ))}
              <div className="sm:col-span-2">
                <TextField label="About me" textarea value={p.intro.about} onChange={v => patch('intro', { ...p.intro, about: v })} />
              </div>
            </div></AccordionContent>
          </AccordionItem>

          <AccordionItem value="skills">
            <AccordionTrigger>Tech stack badges</AccordionTrigger>
            <AccordionContent><div className="p-1 grid gap-4">
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map(preset => {
                  const on = p.skills.some(s => s.name === preset[0])
                  return (
                    <Button key={preset[0]} size="xs" variant={on ? 'default' : 'outline'} aria-pressed={on} onClick={() => toggleSkill(preset)}>
                      {preset[0]}
                    </Button>
                  )
                })}
              </div>
              <p className="text-sm text-muted-foreground">
                Missing something? Add a custom badge. Find logo names on{' '}
                <a className="underline underline-offset-2" href="https://simpleicons.org" target="_blank" rel="noreferrer">simpleicons.org</a>.
              </p>
              <ListEditor<Skill>
                items={p.skills} blank={{ name: '', logo: '', color: '' }} addLabel="Add badge"
                itemLabel={(s, i) => s.name || `Badge ${i + 1}`} onChange={v => patch('skills', v)}
                fields={[{ key: 'name', label: 'Label' }, { key: 'logo', label: 'Logo slug', placeholder: 'e.g. react' }, { key: 'color', label: 'Color (hex)', placeholder: 'e.g. 61DAFB' }]}
              />
            </div></AccordionContent>
          </AccordionItem>

          <AccordionItem value="projects">
            <AccordionTrigger>Projects</AccordionTrigger>
            <AccordionContent><div className="p-1">
              <ListEditor<Project>
                items={p.projects} blank={{ name: '', url: '', description: '', tech: '' }} addLabel="Add project"
                itemLabel={(x, i) => x.name || `Project ${i + 1}`} onChange={v => patch('projects', v)}
                fields={[
                  { key: 'name', label: 'Name' }, { key: 'url', label: 'Link', placeholder: 'https://…' },
                  { key: 'description', label: 'Description', textarea: true },
                  { key: 'tech', label: 'Tech used', placeholder: 'Comma separated, e.g. React, Firebase', wide: true },
                ]}
              />
            </div></AccordionContent>
          </AccordionItem>

          <AccordionItem value="experience">
            <AccordionTrigger>Work experience (optional)</AccordionTrigger>
            <AccordionContent><div className="p-1">
              <ListEditor<Job>
                items={p.experience} blank={{ role: '', company: '', start: '', end: '', description: '' }} addLabel="Add job"
                itemLabel={(x, i) => x.role || x.company || `Job ${i + 1}`} onChange={v => patch('experience', v)}
                fields={[
                  { key: 'role', label: 'Role' }, { key: 'company', label: 'Company' },
                  { key: 'start', label: 'Start', placeholder: 'e.g. Jan 2024' }, { key: 'end', label: 'End', placeholder: 'Leave blank for Present' },
                  { key: 'description', label: 'What you did', textarea: true },
                ]}
              />
            </div></AccordionContent>
          </AccordionItem>

          <AccordionItem value="certificates">
            <AccordionTrigger>Certificates</AccordionTrigger>
            <AccordionContent><div className="p-1">
              <ListEditor<Certificate>
                items={p.certificates} blank={{ name: '', issuer: '', date: '', url: '' }} addLabel="Add certificate"
                itemLabel={(x, i) => x.name || `Certificate ${i + 1}`} onChange={v => patch('certificates', v)}
                fields={[
                  { key: 'name', label: 'Certificate' }, { key: 'issuer', label: 'Issuer' },
                  { key: 'date', label: 'Date' }, { key: 'url', label: 'Credential link', placeholder: 'https://…' },
                ]}
              />
            </div></AccordionContent>
          </AccordionItem>

          <AccordionItem value="socials">
            <AccordionTrigger>Social links</AccordionTrigger>
            <AccordionContent><div className="p-1">
              <ListEditor<Social>
                items={p.socials} blank={{ type: 'github', url: '' }} addLabel="Add link"
                itemLabel={x => SOCIALS[x.type]?.[0] ?? 'Link'} onChange={v => patch('socials', v)}
                fields={[{ key: 'type', label: 'Platform', options: SOCIAL_OPTIONS }, { key: 'url', label: 'URL or email', placeholder: 'https://…' }]}
              />
            </div></AccordionContent>
          </AccordionItem>

          <AccordionItem value="views">
            <AccordionTrigger>Profile views (optional)</AccordionTrigger>
            <AccordionContent><div className="grid gap-4 p-1">
              <p className="text-sm text-muted-foreground">
                A small badge that counts how many times your profile has been opened, from the free komarev.com counter.
              </p>
              <label className="flex items-center gap-2 text-sm font-medium">
                <Switch
                  checked={p.settings.enabled.views}
                  onCheckedChange={on => setSettings({ enabled: { ...p.settings.enabled, views: on } })}
                />
                Show a profile views counter
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="GitHub username" value={p.snake.username} onChange={v => patch('snake', { username: v })}
                  placeholder={snakeUser ? `${snakeUser} (from your GitHub link)` : 'e.g. octocat'}
                />
                <TextField
                  label="Badge label" value={p.settings.titles.views} placeholder="Profile views"
                  onChange={v => setSettings({ titles: { ...p.settings.titles, views: v } })}
                />
              </div>
              {p.settings.enabled.views && !snakeUser && (
                <p className="text-sm text-destructive">Add your GitHub username, or a GitHub link under Social links, to show the counter.</p>
              )}
              <p className="text-sm text-muted-foreground">It counts from zero the first time your profile loads it, and each visit adds one.</p>
            </div></AccordionContent>
          </AccordionItem>

          <AccordionItem value="snake">
            <AccordionTrigger>Contribution snake (optional)</AccordionTrigger>
            <AccordionContent><div className="grid gap-4 p-1">
              <p className="text-sm text-muted-foreground">
                An animated snake that eats your contribution graph, redrawn every day by a free GitHub Action.
              </p>
              <label className="flex items-center gap-2 text-sm font-medium">
                <Switch
                  checked={p.settings.enabled.snake}
                  onCheckedChange={on => setSettings({ enabled: { ...p.settings.enabled, snake: on } })}
                />
                Show the snake on my profile
              </label>
              <TextField
                label="GitHub username" value={p.snake.username} onChange={v => patch('snake', { username: v })}
                placeholder={snakeUser ? `${snakeUser} (from your GitHub link)` : 'e.g. octocat'}
              />
              {p.settings.enabled.snake && !snakeUser && (
                <p className="text-sm text-destructive">Add your GitHub username, or a GitHub link under Social links, to show the snake.</p>
              )}
              <ol className="grid list-decimal gap-2 pl-5 text-sm">
                <li>In your profile repository, choose <strong>Add file → Create new file</strong> and name it <code>.github/workflows/snake.yml</code>.</li>
                <li>Paste the workflow below and commit it to <code>main</code>.</li>
                <li>Wait a minute for the action to finish. The snake shows up on your profile after that, and refreshes daily.</li>
              </ol>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => copy('snake', SNAKE_WORKFLOW)}>
                  {copied === 'snake' ? <Check /> : <Copy />} {copied === 'snake' ? 'Copied' : 'Copy workflow'}
                </Button>
                <Button variant="outline" onClick={() => downloadFile('snake.yml', SNAKE_WORKFLOW)}><Download /> Download snake.yml</Button>
              </div>
              <p className="text-sm text-muted-foreground">Until the action has run once, the preview shows a missing image. That's expected.</p>
            </div></AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="min-w-0 lg:sticky lg:top-6 lg:self-start" data-ui>
          <Tabs defaultValue="preview">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="markdown">Markdown</TabsTrigger>
            </TabsList>
            <Card className="py-0">
              <CardContent className="max-h-[calc(100svh-9rem)] overflow-auto p-0">
                <TabsContent value="preview">
                  <ReadmePreview html={html} />
                </TabsContent>
                <TabsContent value="markdown">
                  <pre className="whitespace-pre-wrap break-all p-6 font-mono text-xs leading-relaxed">{md}</pre>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
          <p className="mt-3 text-sm text-muted-foreground">
            To use it, create a public repository named exactly like your GitHub username and add this file as <code>README.md</code>.
          </p>
        </div>
      </div>
    </div>
  )
}
