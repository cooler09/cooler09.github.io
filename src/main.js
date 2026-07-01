import './style.css'

/* ===========================================================================
   Zachary Lockhart — portfolio behavior.

   Two responsibilities:
     1. Theme toggle (light / dark) with persistence and correct ARIA + meta.
     2. Data-driven project cards fetched from data/projects.json.
   =========================================================================== */

/* ---------------------------------------------------------------------------
   Theme toggle
   --------------------------------------------------------------------------- */

// Surface colors per theme, mirrored from --md-surface so the browser chrome
// (address bar / status bar) matches the page. Keep these in sync with CSS.
const THEME_COLOR = { light: '#f9f9ff', dark: '#111318' }

const root = document.documentElement
const toggle = document.getElementById('theme-toggle')
const themeColorMeta = document.querySelector('meta[name="theme-color"]')

/**
 * Reflect the current theme onto the toggle button (ARIA) and the theme-color
 * meta tag. The `.dark` class is the single source of truth and is set before
 * first paint by the inline script in index.html.
 */
function syncThemeUi() {
  const isDark = root.classList.contains('dark')
  if (toggle) {
    toggle.setAttribute('aria-pressed', String(isDark))
    toggle.setAttribute(
      'aria-label',
      isDark ? 'Switch to light theme' : 'Switch to dark theme',
    )
  }
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', isDark ? THEME_COLOR.dark : THEME_COLOR.light)
  }
}

if (toggle) {
  toggle.addEventListener('click', () => {
    const isDark = root.classList.toggle('dark')
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light')
    } catch {
      /* Persistence is best-effort; ignore private-mode failures. */
    }
    syncThemeUi()
  })
}

// Follow the OS theme while the user hasn't made an explicit choice.
const media = window.matchMedia('(prefers-color-scheme: dark)')
media.addEventListener('change', (event) => {
  let stored = null
  try {
    stored = localStorage.getItem('theme')
  } catch {
    /* ignore */
  }
  if (stored) return // respect an explicit user preference
  root.classList.toggle('dark', event.matches)
  syncThemeUi()
})

syncThemeUi()

/* ---------------------------------------------------------------------------
   Footer year
   --------------------------------------------------------------------------- */
const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = String(new Date().getFullYear())

/* ---------------------------------------------------------------------------
   Projects — fetched from data/projects.json and rendered as Material cards.
   --------------------------------------------------------------------------- */

const grid = document.getElementById('projects-grid')
const status = document.getElementById('projects-status')

/** Small helper: create an element with optional class and text. */
function el(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text != null) node.textContent = text
  return node
}

/** Inline SVG for the "external link" affordance on card links. */
function externalIcon() {
  const NS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('stroke', 'currentColor')
  svg.setAttribute('stroke-width', '1.75')
  svg.setAttribute('stroke-linecap', 'round')
  svg.setAttribute('stroke-linejoin', 'round')
  svg.setAttribute('class', 'h-4 w-4')
  svg.setAttribute('aria-hidden', 'true')
  const p1 = document.createElementNS(NS, 'path')
  p1.setAttribute('d', 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6')
  const p2 = document.createElementNS(NS, 'path')
  p2.setAttribute('d', 'M15 3h6v6m-11 5L21 3')
  svg.append(p1, p2)
  return svg
}

/** Build one Material elevated card for a project. */
function renderProject(project) {
  const card = el('article', 'card-elevated')

  card.append(el('h3', 'text-lg font-semibold text-on-surface', project.name))
  card.append(
    el(
      'p',
      'mt-2 flex-1 text-sm leading-relaxed text-on-surface-variant',
      project.description,
    ),
  )

  // Tags as MD3 chips.
  if (Array.isArray(project.tags) && project.tags.length) {
    const tags = el('ul', 'mt-4 flex flex-wrap gap-2')
    tags.setAttribute('aria-label', 'Technologies')
    for (const tag of project.tags) tags.append(el('li', 'chip', tag))
    card.append(tags)
  }

  // Links: repo always, live only when truthy.
  const links = el('div', 'mt-5 flex flex-wrap items-center gap-4')

  if (project.repoUrl) {
    const repo = el(
      'a',
      'link-underline inline-flex items-center gap-1.5 text-sm',
      'Code',
    )
    repo.href = project.repoUrl
    repo.target = '_blank'
    repo.rel = 'noopener noreferrer'
    repo.setAttribute('aria-label', `${project.name} source code on GitHub`)
    repo.append(externalIcon())
    links.append(repo)
  }

  if (project.liveUrl) {
    const live = el(
      'a',
      'link-underline inline-flex items-center gap-1.5 text-sm',
      'Live',
    )
    live.href = project.liveUrl
    live.target = '_blank'
    live.rel = 'noopener noreferrer'
    live.setAttribute('aria-label', `${project.name} live site`)
    live.append(externalIcon())
    links.append(live)
  }

  if (links.childElementCount) card.append(links)
  return card
}

/** Replace the grid contents with a single status message. */
function showStatus(message) {
  grid.replaceChildren(el('p', 'text-on-surface-variant', message))
}

async function loadProjects() {
  if (!grid) return

  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/projects.json`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const projects = await response.json()

    if (!Array.isArray(projects) || projects.length === 0) {
      showStatus('No projects to show yet — check back soon.')
      return
    }

    const fragment = document.createDocumentFragment()
    for (const project of projects) fragment.append(renderProject(project))
    grid.replaceChildren(fragment)
  } catch (error) {
    console.error('Failed to load projects:', error)
    showStatus('Sorry — projects could not be loaded right now.')
  } finally {
    grid.setAttribute('aria-busy', 'false')
  }
}

loadProjects()
