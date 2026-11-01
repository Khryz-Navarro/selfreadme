import assert from 'node:assert/strict'
import { test } from 'node:test'
import { badgeUrl, defaultProfile, generateReadme } from '../src/lib/readme.ts'

test('badge labels escape shields separators and pick a readable logo color', () => {
  assert.equal(badgeUrl('Node-RED', 'nodered', '#8F0000', 'flat'), 'https://img.shields.io/badge/Node--RED-8F0000?style=flat&logo=nodered&logoColor=white')
  assert.match(badgeUrl('C++', '', 'zz', 'flat'), /badge\/C%2B%2B-555555\?style=flat$/)
  assert.match(badgeUrl('JS', 'javascript', 'F7DF1E', 'flat'), /logoColor=black/)
})

test('sections follow order, skip disabled and empty ones', () => {
  const p = defaultProfile()
  p.settings.order = ['socials', 'intro', 'skills', 'projects', 'experience', 'certificates']
  p.settings.enabled.experience = false
  p.certificates = [{ name: '', issuer: 'x', date: '', url: '' }]
  const md = generateReadme(p)
  assert.ok(md.indexOf('Connect with me') < md.indexOf("Hi 👋, I'm Your Name"))
  assert.ok(!md.includes('Work Experience'))
  assert.ok(!md.includes('Certificates'))
  assert.ok(md.includes('href="mailto:you@example.com"'))
})

test('user text cannot break out of html attributes', () => {
  const p = defaultProfile()
  p.intro.avatar = 'x" onerror="alert(1)'
  assert.ok(generateReadme(p).includes('src="x&quot; onerror=&quot;alert(1)"'))
})

test('snake uses the GitHub link username and rejects unsafe names', async () => {
  const { githubUser } = await import('../src/lib/readme.ts')
  const p = defaultProfile()
  assert.ok(!generateReadme(p).includes('snake'), 'off by default')
  p.settings.enabled.snake = true
  assert.ok(generateReadme(p).includes('raw.githubusercontent.com/you/you/output/github-contribution-grid-snake-dark.svg'))
  p.snake.username = '@octo-cat'
  assert.equal(githubUser(p), 'octo-cat')
  p.snake.username = 'evil"/><script>'
  assert.equal(githubUser(p), '')
  assert.ok(!generateReadme(p).includes('picture'))
})

test('older saved profiles gain new sections without losing settings', async () => {
  const { mergeProfile } = await import('../src/lib/readme.ts')
  const saved = defaultProfile() as any
  saved.settings.order = ['socials', 'intro', 'skills', 'projects', 'experience', 'certificates']
  delete saved.settings.enabled.snake
  delete saved.settings.titles.snake
  delete saved.snake
  const m = mergeProfile(saved)
  assert.deepEqual(m.settings.order, ['socials', 'intro', 'skills', 'projects', 'experience', 'certificates', 'views', 'snake'])
  assert.equal(m.settings.enabled.snake, false)
  assert.equal(m.settings.titles.snake, '🐍 Contribution Snake')
  assert.deepEqual(m.snake, { username: '' })
})

test('landing visitor name and username carry into the editor profile', async () => {
  const { applyVisitor } = await import('../src/lib/readme.ts')
  const p = applyVisitor(defaultProfile(), ' Ana Cruz ', 'anacruz')
  assert.equal(p.intro.name, 'Ana Cruz')
  assert.equal(p.snake.username, 'anacruz')
  assert.equal(p.socials.find(s => s.type === 'github')?.url, 'https://github.com/anacruz')
  assert.equal(p.socials.length, defaultProfile().socials.length, 'replaces the GitHub link, adds none')
  const noGithub = { ...defaultProfile(), socials: [] }
  assert.deepEqual(applyVisitor(noGithub, '', 'x1').socials, [{ type: 'github', url: 'https://github.com/x1' }])
  assert.equal(applyVisitor(noGithub, '', 'x1').intro.name, 'Your Name', 'blank name leaves it alone')
})

test('profile views counter is off by default and uses the username and heading as label', async () => {
  const p = defaultProfile()
  assert.ok(!generateReadme(p).includes('komarev'))
  p.settings.enabled.views = true
  p.settings.titles.views = 'Visitors'
  p.settings.badgeStyle = 'social'
  const md = generateReadme(p)
  assert.ok(md.includes('https://komarev.com/ghpvc/?username=you&amp;label=Visitors&amp;color=0e75b6&amp;style=flat'))
  assert.ok(md.indexOf('komarev') < md.indexOf('Tech Stack'), 'sits under the intro by default')
  p.socials = []
  assert.ok(!generateReadme(p).includes('komarev'), 'no username, no counter')
})
