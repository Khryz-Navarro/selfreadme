import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import Editor, { useProfile } from '@/App'
import Feedback from './Feedback'
import ThemePanel from './ThemePanel'
import { Switch } from '@/components/ui/switch'
import { applyVisitor, badgeUrl, githubUser, PRESETS } from '@/lib/readme'
import editorImg from './img/editor.jpg'

const EDITOR = '#editor'

const v = (o: Record<string, string | number>) => o as CSSProperties

// Public visit counter on Abacus (no cookies, CORS open, 30 requests per 10 s per visitor).
const VISITS = 'https://abacus.jasoncameron.dev'
const VISITS_KEY = 'khryz-navarro.github.io/selfreadme-visits'
const COUNTED = 'selfreadme-visit-counted'

// Counts one visit per browser session on the deployed site; local dev and previews only read the count.
function VisitCounter() {
  const [visits, setVisits] = useState<number | 'error' | null>(null)

  useEffect(() => {
    let counted = false
    try { counted = sessionStorage.getItem(COUNTED) === '1' } catch { /* storage blocked: count this load */ }
    const live = import.meta.env.PROD && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)
    const action = live && !counted ? 'hit' : 'get'
    let gone = false
    fetch(`${VISITS}/${action}/${VISITS_KEY}`)
      // A counter nobody has hit yet doesn't exist: that's zero visits, not an error.
      .then(r => (r.ok ? r.json() : r.status === 404 ? { value: 0 } : Promise.reject(new Error(String(r.status)))))
      .then((d: { value: number }) => {
        if (action === 'hit') try { sessionStorage.setItem(COUNTED, '1') } catch { /* counted again next load */ }
        if (!gone) setVisits(d.value)
      })
      .catch(() => { if (!gone) setVisits('error') })
    return () => { gone = true }
  }, [])

  return (
    <section className="visits" aria-labelledby="visits-title">
      <div className="tile visits-head">
        <h2 id="visits-title" className="head">Site visits</h2>
        <p>Visits to Selfreadme since November 2026.</p>
      </div>
      <div className="tile visits-count">
        <p className="visits-number" aria-live="polite">
          {visits === null ? '…' : visits === 'error' ? '–' : new Intl.NumberFormat('en').format(visits)}
        </p>
        <p className="visits-note">
          {visits === 'error'
            ? "The count couldn't load right now."
            : 'Counted once per browser session with Abacus. No cookies, and nothing you type is sent.'}
        </p>
      </div>
    </section>
  )
}

function SnakeGrid({ cols, rows, className, label, on = true }: { cols: number; rows: number; className: string; label: string; on?: boolean }) {
  const levels = useMemo(() => {
    let seed = 7
    return Array.from({ length: cols * rows }, () => {
      seed = (seed * 16807) % 2147483647
      const r = seed / 2147483647
      return r > 0.86 ? 4 : r > 0.68 ? 3 : r > 0.45 ? 2 : r > 0.25 ? 1 : 0
    })
  }, [cols, rows])
  // Serpentine path: down the first column, up the next.
  const path = useMemo(() => {
    const out: number[] = []
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) out.push((c % 2 ? rows - 1 - r : r) * cols + c)
    return out
  }, [cols, rows])
  const [step, setStep] = useState(3)

  useEffect(() => {
    if (!on || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setStep(s => (s + 1) % path.length), 140)
    return () => clearInterval(t)
  }, [path.length, on])

  const eaten = new Set(on ? path.slice(0, step + 1) : [])
  const body = new Set(on ? [0, 1, 2, 3].map(k => path[(step - k + path.length) % path.length]) : [])
  return (
    <div className={className} role="img" aria-label={label}>
      {levels.map((l, i) => <i key={i} data-l={eaten.has(i) ? 0 : l} className={body.has(i) ? 'snake' : undefined} />)}
    </div>
  )
}

const DEMO_SECTIONS = ['Introduction', 'Tech stack', 'Projects', 'Work experience', 'Certificates']

// Clickable stand-ins for the editor on the features board. Demo state only: the visitor's profile is untouched.
function BoardDemos() {
  const [picked, setPicked] = useState(['JavaScript', 'Python', 'CSS'])
  const [snake, setSnake] = useState(true)
  const [hidden, setHidden] = useState(['Work experience'])
  const flip = (list: string[], x: string) => (list.includes(x) ? list.filter(y => y !== x) : [...list, x])

  return (
    <>
      <div className="tile macro demo b-badges" data-reveal style={v({ '--i': 1 })} data-ui>
        <div className="chips" role="group" aria-label="Badge presets">
          {PRESETS.map(([n]) => (
            <button key={n} type="button" aria-pressed={picked.includes(n)} onClick={() => setPicked(l => flip(l, n))}>{n}</button>
          ))}
        </div>
        <div className="demo-badges" aria-live="polite">
          {picked.length
            ? PRESETS.filter(([n]) => picked.includes(n)).map(([n, logo, color]) => (
              <img key={n} src={badgeUrl(n, logo, color, 'for-the-badge')} alt={n} height={28} />
            ))
            : <p>Tap a badge to see it here.</p>}
        </div>
        <p className="cap"><b>43 badge presets</b>Tap Python, React or Figma; the badge and its logo are added for you.</p>
      </div>
      <div className="tile macro demo b-snake" data-reveal style={v({ '--i': 2 })} data-ui>
        <label className="demo-switch"><Switch checked={snake} onCheckedChange={setSnake} /> Show the snake</label>
        <div className="demo-grid-box">
          <SnakeGrid cols={10} rows={8} className="hero-grid demo-grid" label="A contribution graph with the snake eating its way through" on={snake} />
        </div>
        <p className="cap"><b>Contribution snake</b>The daily GitHub Action is written for you.</p>
      </div>
      <div className="tile macro demo b-layout" data-reveal style={v({ '--i': 3 })} data-ui>
        <ul className="demo-list" aria-label="Sections">
          {DEMO_SECTIONS.map(n => (
            <li key={n}><label className="demo-switch"><Switch checked={!hidden.includes(n)} onCheckedChange={() => setHidden(l => flip(l, n))} /> {n}</label></li>
          ))}
        </ul>
        <p className="cap"><b>Your order, your headings</b>Hide, rename and reorder any section.</p>
      </div>
    </>
  )
}

export default function Landing() {
  const [p, setP] = useProfile()
  const user = githubUser(p)
  const setName = (name: string) => setP(prev => ({ ...prev, intro: { ...prev.intro, name } }))
  const setUser = (raw: string) => {
    const u = raw.replace(/[^A-Za-z0-9-]/g, '').slice(0, 39)
    setP(prev => (u ? applyVisitor(prev, '', u) : { ...prev, snake: { username: '' } }))
  }

  // Reveal once on entering the viewport; never leaves content hidden.
  useEffect(() => {
    const targets = [...document.querySelectorAll<HTMLElement>('[data-reveal]')]
    if (!('IntersectionObserver' in window)) { targets.forEach(el => el.classList.add('is-in')); return }
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 })
    targets.forEach(el => io.observe(el))
    const late = setTimeout(() => targets.forEach(el => {
      const r = el.getBoundingClientRect()
      if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in')
    }), 2500)
    return () => { io.disconnect(); clearTimeout(late) }
  }, [])

  return (
    <>
      <header className="hero" aria-labelledby="title">
        <div className="band" aria-hidden="true">
          <div className="band-track">
            {Array.from({ length: 8 }, (_, i) => <span key={i}>Selfreadme</span>)}
          </div>
        </div>

        <nav className="links" aria-label="Selfreadme">
          <a className="tile link-tile" style={v({ '--i': 1 })} href="#editor">Build yours</a>
          <a className="tile link-tile" style={v({ '--i': 2 })} href="#features">What's included</a>
          <a className="tile link-tile" style={v({ '--i': 3 })} href="#steps">How it works</a>
          <a className="tile link-tile" style={v({ '--i': 4 })} href="#faq">Questions</a>
          <ThemePanel style={v({ '--i': 5 })} />
        </nav>

        <div className="rail-left" style={v({ '--i': 2 })}>
          <SnakeGrid cols={7} rows={11} className="tile hero-grid" label="A contribution graph in Selfreadme's five shades, with the snake eating its way through" />
          <ul className="tile facts" aria-label="Selfreadme in numbers" style={v({ '--i': 1 })}>
            <li><b>8</b> sections to fill</li>
            <li><b>43</b> tech badges</li>
            <li><b>15</b> social platforms</li>
            <li><b>0</b> lines of markdown</li>
            <li><b>1</b> file: README.md</li>
          </ul>
        </div>

        <div className="centre" style={v({ '--i': 3 })}>
          <div className="tile live" data-ui>
            <form className="live-form" onSubmit={e => e.preventDefault()}>
              <label>Your name <input value={p.intro.name} onChange={e => setName(e.target.value.slice(0, 40))} autoComplete="name" maxLength={40} /></label>
              <label>GitHub username
                <input value={p.snake.username || user} onChange={e => setUser(e.target.value)} autoComplete="username" maxLength={39} spellCheck={false} />
              </label>
            </form>
            <div className="file">
              <p className="file-path">{user || 'you'} / {user || 'you'} / README.md</p>
              <div className="readme" aria-live="polite">
                <p className="r-title">Hi, I'm {p.intro.name.trim() || 'Your Name'}</p>
                {p.intro.title.trim() && <p className="r-sub">{p.intro.title}</p>}
                <p className="r-badges">
                  {p.skills.filter(x => x.name.trim()).slice(0, 4).map((x, i) => (
                    <img key={i} src={badgeUrl(x.name, x.logo, x.color, p.settings.badgeStyle)} alt={x.name} height={28} width={100} />
                  ))}
                </p>
                <p className="r-link">github.com/{user || 'you'}</p>
              </div>
            </div>
          </div>
          <div className="tile statement" style={v({ '--i': 1 })}>
            <h1 id="title">Your GitHub profile, written for you</h1>
            <p className="lead">Fill in a form, pick your badges, download README.md. No markdown, no sign-in.</p>
          </div>
        </div>

        <div className="rail-right" style={v({ '--i': 4 })}>
          <p className="tile shade s0" style={v({ '--i': 1 })}>Free to use</p>
          <p className="tile shade s1" style={v({ '--i': 2 })}>No account needed</p>
          <p className="tile shade s2" style={v({ '--i': 3 })}>Saved in your browser</p>
          <p className="tile shade s3" style={v({ '--i': 4 })}>Matches GitHub's preview</p>
          <a className="tile shade s4 action" style={v({ '--i': 5 })} href={EDITOR}>Build my README</a>
        </div>
      </header>

      <main>
        <section className="editor-section dark" id="editor" aria-labelledby="editor-title">
          <Editor p={p} setP={setP} />
        </section>

        <section className="board" id="features" aria-labelledby="features-title">
          <div className="tile b-head" data-reveal>
            <h2 id="features-title" className="head">Everything a profile needs</h2>
          </div>
          <BoardDemos />
          <div className="tile macro b-socials" data-reveal style={v({ '--i': 2 })} data-ui>
            <div className="big-badges" aria-hidden="true">
              <img src={badgeUrl('GitHub', 'github', '181717', 'for-the-badge')} width={105} height={28} alt="" />
              <img src={badgeUrl('LeetCode', 'leetcode', 'FFA116', 'for-the-badge')} width={120} height={28} alt="" />
              <img src={badgeUrl('Dev.to', 'devdotto', '0A0A0A', 'for-the-badge')} width={96} height={28} alt="" />
            </div>
            <p className="cap"><b>15 social platforms</b>GitHub, LinkedIn, X, Dev.to, LeetCode, email and more.</p>
          </div>
          <div className="tile macro b-copy" data-reveal style={v({ '--i': 3 })} data-ui>
            <span className="key" aria-hidden="true">README.md</span>
            <p className="cap"><b>Copy or download</b>One click gives you the finished file.</p>
          </div>
          <div className="tile macro b-private" data-reveal style={v({ '--i': 4 })} data-ui>
            <span className="word" aria-hidden="true">No sign-in</span>
            <p className="cap"><b>Nothing to sign up for</b>Your profile stays in this browser.</p>
          </div>
        </section>

        <section className="steps" id="steps" aria-labelledby="steps-title">
          <div className="field f1">
            <h2 id="steps-title">From form to profile</h2>
            <div className="card" data-ui>
              <p className="card-top">README.md</p>
              <p className="card-name">Hi, I'm Maya Reyes</p>
              <p className="card-line">CS student building small, useful web apps</p>
            </div>
            <p className="clause">First, fill in who you are and what you build.</p>
          </div>
          {([
            ['f2', 'README.md', '', 'Then tap the badges and links you want.'],
            ['f3', 'README.md', 'Downloaded', 'Next, download README.md in one click.'],
            ['f4', 'mayareyes / mayareyes', 'Live on github.com/mayareyes', 'Last, commit it to a repo named after you.'],
          ] as const).map(([cls, top, done, clause]) => (
            <div key={cls} className={`field ${cls}`}>
              <div className="card" data-ui>
                <p className="card-top">{top}{cls === 'f3' && <span>2.4 KB</span>}</p>
                <p className="card-name">Hi, I'm Maya Reyes</p>
                <p className="card-chips">
                  <span style={v({ '--c': '#3776AB' })}>Python</span>
                  <span style={v({ '--c': '#F7DF1E', '--k': '#000' })}>JavaScript</span>
                  <span style={v({ '--c': '#61DAFB', '--k': '#000' })}>React</span>
                </p>
                {done && <p className={`card-done${cls === 'f4' ? ' live-on' : ''}`}>{done}</p>}
              </div>
              <p className="clause">{clause}</p>
            </div>
          ))}
        </section>

        <section className="faq" id="faq" aria-labelledby="faq-title">
          <h2 id="faq-title" className="head">Questions first{'‑'}timers ask</h2>
          <div className="faq-list">
            {FAQ.map(([q, a], i) => (
              <details key={q} name="faq" open={i === 0}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="cta" aria-labelledby="cta-title">
          <figure className="tile cta-side cta-pic macro">
            <img src={editorImg} width={2880} height={1800} alt="The Selfreadme editor's introduction form with name, headline and location fields" loading="lazy" style={v({ '--w': '1440px', '--x': '-62px', '--y': '-128px' })} />
          </figure>
          <div className="tile cta-main" data-reveal>
            <h2 id="cta-title" className="head">Start your README</h2>
            <div className="cta-copy">
              <p>It takes one sitting. Fill it in, download the file, and your profile is ready before the coffee goes cold.</p>
              <a className="button" href={EDITOR}>Go to the editor</a>
            </div>
          </div>
          <div className="tile cta-side s2" aria-hidden="true" />
        </section>

        <VisitCounter />
      </main>

      <footer className="footer" aria-label="Selfreadme">
        <p className="mark" aria-label="Selfreadme">
          {[...'Selfreadme'].map((ch, i) => (
            <span key={i} aria-hidden="true" style={v({ '--h': `${[100, 72, 86, 64, 94, 70, 90, 78, 96, 68][i]}%`, '--c': i % 2 ? 'var(--ink)' : 'var(--s4)', '--l': i % 2 ? 'var(--bg)' : 'var(--pink-ink)' })}>{ch}</span>
          ))}
        </p>
        <div className="foot-cols">
          <ul aria-label="Selfreadme">
            <li><a className="link" href={EDITOR}>Go to the editor</a></li>
            <li><a className="link" href="#features">What's included</a></li>
            <li><a className="link" href="#faq">Questions</a></li>
            <li><a className="link" href="https://github.com/Khryz-Navarro/selfreadme">Source code on GitHub</a></li>
            <li><a className="link" href="https://buymeacoffee.com/khryznavarz">Buy me a coffee</a></li>
          </ul>
          <ul aria-label="Learn more">
            <li><a className="link" href="https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme">GitHub's profile README guide</a></li>
            <li><a className="link" href="https://shields.io">shields.io badges</a></li>
            <li><a className="link" href="https://simpleicons.org">Simple Icons logos</a></li>
            <li><a className="link" href="https://github.com/Platane/snk">The snake action</a></li>
          </ul>
          <p className="foot-note">Made for students and new developers putting together their first GitHub profile. Selfreadme is not affiliated with GitHub.</p>
        </div>
        <div className="foot-last">
          <p>© 2026 Selfreadme<span className="credit">Developed by Khryz</span></p>
          <a className="button small" href={EDITOR}>Build my README</a>
        </div>
      </footer>

      <Feedback />
    </>
  )
}

const FAQ: [string, string][] = [
  ['What is a GitHub profile README?', "A file called README.md in a public repository named exactly like your username. GitHub shows it at the top of your profile, above your pinned repositories, so it's the first thing a recruiter or classmate reads."],
  ['Why does the repository need my username as its name?', 'That\'s how GitHub knows it\'s your profile README. If your username is mayareyes, the repository is github.com/mayareyes/mayareyes. Create it as public and tick "Add a README file", then replace that file with yours.'],
  ['Do I need to know markdown or HTML?', 'No. You fill in fields and tap badges; Selfreadme writes the markdown and the small bits of HTML GitHub allows for centring and badges. You can look at the code it writes, but you never have to touch it.'],
  ['Is it free? Do I need an account?', "It's free, and there's no account. The editor is right on this page; start typing."],
  ['Where is my information stored?', 'Only in your own browser, so you can close the tab and pick up where you left off. Nothing you type is sent to a Selfreadme server. Badge images load from shields.io, the same place your finished profile loads them from, and each visit adds one to a public visit counter on Abacus, without cookies. If you send feedback, that message (with your browser and screen size) goes to the developer by email through FormSubmit.'],
  ['Can I change it later?', 'Yes. Come back in the same browser and your profile is still there. Edit it, download again, and replace README.md in your repository.'],
  ['How does the contribution snake work?', 'Selfreadme gives you a small GitHub Actions file to copy or download. Add it to your profile repository and GitHub redraws the snake from your contribution graph every day.'],
  ['Will it look the same on GitHub?', 'The preview uses GitHub\'s own markdown styles and only the HTML GitHub accepts, so what you approve is what visitors see.'],
]
