// Data + pure markdown builder for the profile README.

export type SectionKey = 'intro' | 'skills' | 'projects' | 'experience' | 'certificates' | 'socials' | 'snake' | 'views'
export type BadgeStyle = 'for-the-badge' | 'flat' | 'flat-square' | 'plastic' | 'social'

export interface Skill { name: string; logo: string; color: string }
export interface Project { name: string; url: string; description: string; tech: string }
export interface Job { role: string; company: string; start: string; end: string; description: string }
export interface Certificate { name: string; issuer: string; date: string; url: string }
export interface Social { type: string; url: string }

export interface Profile {
  settings: {
    badgeStyle: BadgeStyle
    align: 'center' | 'left'
    order: SectionKey[]
    enabled: Record<SectionKey, boolean>
    titles: Record<SectionKey, string>
  }
  intro: {
    name: string; title: string; avatar: string; about: string
    location: string; working: string; learning: string; askMe: string; funFact: string
  }
  skills: Skill[]
  projects: Project[]
  experience: Job[]
  certificates: Certificate[]
  socials: Social[]
  snake: { username: string }
}

// [label, simple-icons slug (https://simpleicons.org), brand hex]
export const PRESETS: [string, string, string][] = [
  ['JavaScript', 'javascript', 'F7DF1E'], ['TypeScript', 'typescript', '3178C6'], ['Python', 'python', '3776AB'],
  ['Java', 'openjdk', 'ED8B00'], ['C', 'c', 'A8B9CC'], ['C++', 'cplusplus', '00599C'], ['C#', 'dotnet', '512BD4'],
  ['Go', 'go', '00ADD8'], ['Rust', 'rust', '000000'], ['PHP', 'php', '777BB4'], ['Ruby', 'ruby', 'CC342D'],
  ['Kotlin', 'kotlin', '7F52FF'], ['Swift', 'swift', 'F05138'], ['Dart', 'dart', '0175C2'],
  ['HTML5', 'html5', 'E34F26'], ['CSS', 'css', '663399'], ['Tailwind CSS', 'tailwindcss', '06B6D4'],
  ['Bootstrap', 'bootstrap', '7952B3'], ['React', 'react', '61DAFB'], ['Next.js', 'nextdotjs', '000000'],
  ['Vue.js', 'vuedotjs', '4FC08D'], ['Angular', 'angular', 'DD0031'], ['Svelte', 'svelte', 'FF3E00'],
  ['Node.js', 'nodedotjs', '5FA04E'], ['Express', 'express', '000000'], ['Django', 'django', '092E20'],
  ['Flask', 'flask', '000000'], ['Spring', 'spring', '6DB33F'], ['Laravel', 'laravel', 'FF2D20'],
  ['Flutter', 'flutter', '02569B'], ['MySQL', 'mysql', '4479A1'], ['PostgreSQL', 'postgresql', '4169E1'],
  ['MongoDB', 'mongodb', '47A248'], ['SQLite', 'sqlite', '003B57'], ['Firebase', 'firebase', 'FFCA28'],
  ['Redis', 'redis', 'FF4438'], ['Docker', 'docker', '2496ED'], ['Kubernetes', 'kubernetes', '326CE5'],
  ['Google Cloud', 'googlecloud', '4285F4'], ['Git', 'git', 'F05032'], ['GitHub Actions', 'githubactions', '2088FF'],
  ['Linux', 'linux', 'FCC624'], ['Figma', 'figma', 'F24E1E'],
]

// Shields' bundled icons lack LinkedIn, so its logo is passed as a data URI (simple-icons path, white fill).
const LINKEDIN_LOGO = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="white" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>')}`

export const SOCIALS: Record<string, [string, string, string]> = {
  github: ['GitHub', 'github', '181717'], linkedin: ['LinkedIn', LINKEDIN_LOGO, '0A66C2'], x: ['X', 'x', '000000'],
  instagram: ['Instagram', 'instagram', 'E4405F'], facebook: ['Facebook', 'facebook', '0866FF'],
  youtube: ['YouTube', 'youtube', 'FF0000'], devto: ['Dev.to', 'devdotto', '0A0A0A'], medium: ['Medium', 'medium', '000000'],
  hashnode: ['Hashnode', 'hashnode', '2962FF'], discord: ['Discord', 'discord', '5865F2'],
  stackoverflow: ['Stack Overflow', 'stackoverflow', 'F58025'], kaggle: ['Kaggle', 'kaggle', '20BEFF'],
  leetcode: ['LeetCode', 'leetcode', 'FFA116'], website: ['Portfolio', 'googlechrome', '4285F4'], email: ['Email', 'gmail', 'EA4335'],
}

export const SECTION_KEYS: SectionKey[] = ['intro', 'views', 'skills', 'projects', 'experience', 'certificates', 'socials', 'snake']

export function defaultProfile(): Profile {
  return {
    settings: {
      badgeStyle: 'for-the-badge',
      align: 'center',
      order: [...SECTION_KEYS],
      enabled: { intro: true, skills: true, projects: true, experience: true, certificates: true, socials: true, snake: false, views: false },
      titles: {
        intro: "Hi 👋, I'm", skills: '🛠️ Tech Stack', projects: '🚀 Projects', experience: '💼 Work Experience',
        certificates: '📜 Certificates', socials: '🌐 Connect with me',
        snake: '🐍 Contribution Snake',
        views: 'Profile views',
      },
    },
    intro: {
      name: 'Your Name', title: 'Full-stack developer who loves building useful things', avatar: '',
      about: 'I build web apps and enjoy turning ideas into products. Replace this with a few lines about yourself.',
      location: 'Manila, Philippines', working: 'Selfreadme', learning: 'Rust', askMe: 'JavaScript, React, Node.js',
      funFact: 'I debug better after coffee ☕',
    },
    skills: (['JavaScript', 'React', 'Node.js', 'Git'] as const).map(n => {
      const [name, logo, color] = PRESETS.find(p => p[0] === n)!
      return { name, logo, color }
    }),
    projects: [{ name: 'Selfreadme', url: 'https://github.com/you/selfreadme', description: 'A no-code GitHub profile README generator.', tech: 'React, TypeScript, shadcn/ui' }],
    experience: [{ role: 'Software Engineer', company: 'Acme Inc.', start: 'Jan 2024', end: '', description: 'Built and shipped customer-facing features.' }],
    certificates: [{ name: 'Example Certificate', issuer: 'Issuer', date: '2025', url: '' }],
    socials: [{ type: 'github', url: 'https://github.com/you' }, { type: 'linkedin', url: 'https://linkedin.com/in/you' }, { type: 'email', url: 'you@example.com' }],
    snake: { username: '' },
  }
}

// Browser storage key shared by the editor and the landing page.
export const STORAGE_KEY = 'selfreadme'
// Profiles saved before the project was renamed from GitFolio.
export const LEGACY_STORAGE_KEY = 'gitfolio'

// Carries the name and GitHub username typed on the landing page into a profile; blanks leave fields as they are.
export function applyVisitor(p: Profile, name: string, user: string): Profile {
  const next = { ...p, intro: { ...p.intro } }
  if (has(name)) next.intro.name = name.trim()
  if (has(user)) {
    const url = `https://github.com/${user.trim()}`
    next.snake = { username: user.trim() }
    next.socials = p.socials.some(s => s.type === 'github')
      ? p.socials.map(s => (s.type === 'github' ? { ...s, url } : s))
      : [{ type: 'github', url }, ...p.socials]
  }
  return next
}

// Fills older saved profiles with sections added since they were stored.
export function mergeProfile(saved: Partial<Profile>): Profile {
  const d = defaultProfile()
  const s = { ...d.settings, ...saved.settings }
  s.enabled = { ...d.settings.enabled, ...saved.settings?.enabled }
  s.titles = { ...d.settings.titles, ...saved.settings?.titles }
  s.order = [...s.order.filter(k => SECTION_KEYS.includes(k)), ...SECTION_KEYS.filter(k => !s.order.includes(k))]
  return { ...d, ...saved, settings: s }
}

// Platane/snk draws the contribution graph as a snake SVG and publishes it to the profile repo's "output" branch.
export const SNAKE_WORKFLOW = `name: Generate snake animation

on:
  schedule:
    - cron: "0 0 * * *"
  workflow_dispatch:
  push:
    branches: [main]

permissions:
  contents: write

jobs:
  generate:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: Platane/snk@v3
        with:
          github_user_name: \${{ github.repository_owner }}
          outputs: |
            dist/github-contribution-grid-snake.svg
            dist/github-contribution-grid-snake-dark.svg?palette=github-dark

      - uses: crazy-max/ghaction-github-pages@v4
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`

const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const has = (v: string | undefined) => (v ?? '').trim() !== ''

function isLight(hex: string) {
  if (hex.length !== 6) return false
  const [r, g, b] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16))
  return 0.299 * r + 0.587 * g + 0.114 * b > 160
}

// Shields static badges treat "-" and "_" as separators, so they are doubled.
export function badgeUrl(label: string, logo: string, color: string, style: BadgeStyle) {
  const text = encodeURIComponent(label.replace(/-/g, '--').replace(/_/g, '__'))
  const hex = color.replace(/[^0-9a-fA-F]/g, '').slice(0, 6) || '555555'
  const q = new URLSearchParams({ style })
  if (has(logo)) {
    q.set('logo', logo.trim())
    q.set('logoColor', isLight(hex) ? 'black' : 'white')
  }
  return `https://img.shields.io/badge/${text}-${hex}?${q}`
}

// Explicit username wins, else it comes from the GitHub social link. Only valid usernames reach the URL.
export function githubUser(p: Profile) {
  const raw = has(p.snake.username)
    ? p.snake.username.trim().replace(/^@/, '')
    : (p.socials.find(s => s.type === 'github')?.url.match(/github\.com\/([^/?#\s]+)/i)?.[1] ?? '')
  return /^[A-Za-z0-9-]{1,39}$/.test(raw) ? raw : ''
}

const link =(text: string, url: string) => (has(url) ? `[${text}](${url.trim()})` : text)

const SECTIONS: Record<SectionKey, (p: Profile, title: string) => string> = {
  intro(p, title) {
    const i = p.intro, a = p.settings.align, out: string[] = []
    if (has(i.name)) out.push(`<h1 align="${a}">${esc(title)} ${esc(i.name)}</h1>`)
    if (has(i.title)) out.push(`<h3 align="${a}">${esc(i.title)}</h3>`)
    if (has(i.avatar)) out.push(`<p align="${a}"><img src="${esc(i.avatar.trim())}" alt="${esc(i.name)}" width="160" /></p>`)
    if (has(i.about)) out.push(i.about.trim())
    const facts = ([
      ['🔭', "I'm currently working on", i.working], ['🌱', "I'm currently learning", i.learning],
      ['📍', 'Based in', i.location], ['💬', 'Ask me about', i.askMe], ['⚡', 'Fun fact:', i.funFact],
    ] as const).filter(f => has(f[2])).map(([e, t, v]) => `- ${e} ${t} **${v.trim()}**`)
    if (facts.length) out.push(facts.join('\n'))
    return out.join('\n\n')
  },
  skills(p, title) {
    const items = p.skills.filter(x => has(x.name))
    if (!items.length) return ''
    const imgs = items.map(x => `<img src="${esc(badgeUrl(x.name, x.logo, x.color, p.settings.badgeStyle))}" alt="${esc(x.name)}" />`)
    return `## ${title}\n\n<p align="${p.settings.align}">\n  ${imgs.join('\n  ')}\n</p>`
  },
  projects(p, title) {
    const items = p.projects.filter(x => has(x.name))
    if (!items.length) return ''
    const blocks = items.map(x => {
      const lines = [`### ${link(x.name.trim(), x.url)}`]
      if (has(x.description)) lines.push(x.description.trim())
      const tech = x.tech.split(',').map(t => t.trim()).filter(Boolean)
      if (tech.length) lines.push(tech.map(t => `\`${t}\``).join(' '))
      return lines.join('\n\n')
    })
    return `## ${title}\n\n${blocks.join('\n\n')}`
  },
  experience(p, title) {
    const items = p.experience.filter(e => has(e.role) || has(e.company))
    if (!items.length) return ''
    const blocks = items.map(e => {
      const lines = [`### ${[e.role, e.company].filter(has).map(v => v.trim()).join(' · ')}`]
      if (has(e.start)) lines.push(`_${e.start.trim()} – ${has(e.end) ? e.end.trim() : 'Present'}_`)
      if (has(e.description)) lines.push(e.description.trim())
      return lines.join('\n\n')
    })
    return `## ${title}\n\n${blocks.join('\n\n')}`
  },
  certificates(p, title) {
    const items = p.certificates.filter(c => has(c.name))
    if (!items.length) return ''
    const lines = items.map(c => {
      const meta = [c.issuer, c.date].filter(has).map(v => v.trim()).join(', ')
      return `- **${link(c.name.trim(), c.url)}**${meta ? ` — ${meta}` : ''}`
    })
    return `## ${title}\n\n${lines.join('\n')}`
  },
  socials(p, title) {
    const items = p.socials.filter(x => has(x.url) && SOCIALS[x.type])
    if (!items.length) return ''
    const links = items.map(x => {
      const [label, logo, color] = SOCIALS[x.type]
      const url = x.type === 'email' && !x.url.startsWith('mailto:') ? `mailto:${x.url.trim()}` : x.url.trim()
      return `<a href="${esc(url)}"><img src="${esc(badgeUrl(label, logo, color, p.settings.badgeStyle))}" alt="${label}" /></a>`
    })
    return `## ${title}\n\n<p align="${p.settings.align}">\n  ${links.join('\n  ')}\n</p>`
  },
  // A visit counter badge from komarev.com/ghpvc; the section's heading is used as the badge label.
  views(p, title) {
    const user = githubUser(p)
    if (!user) return ''
    const style = p.settings.badgeStyle === 'social' ? 'flat' : p.settings.badgeStyle
    const q = new URLSearchParams({ username: user, label: title.trim() || 'Profile views', color: '0e75b6', style })
    return `<p align="${p.settings.align}">\n  <img src="https://komarev.com/ghpvc/?${esc(q.toString())}" alt="${esc(title.trim() || 'Profile views')}" />\n</p>`
  },
  snake(p, title) {
    const user = githubUser(p)
    if (!user) return ''
    const base = `https://raw.githubusercontent.com/${user}/${user}/output/github-contribution-grid-snake`
    return [
      `## ${title}`, '',
      `<p align="${p.settings.align}">`,
      '  <picture>',
      `    <source media="(prefers-color-scheme: dark)" srcset="${base}-dark.svg" />`,
      `    <source media="(prefers-color-scheme: light)" srcset="${base}.svg" />`,
      `    <img alt="GitHub contribution snake animation" src="${base}.svg" />`,
      '  </picture>',
      '</p>',
    ].join('\n')
  },
}

export function generateReadme(p: Profile) {
  const { order, enabled, titles } = p.settings
  return order.filter(k => enabled[k]).map(k => SECTIONS[k](p, titles[k])).filter(Boolean).join('\n\n') + '\n'
}
