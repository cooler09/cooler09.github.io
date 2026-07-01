import './style.css'

/* ===========================================================================
   Zachary Lockhart — portfolio behavior.

   Responsibilities:
     1. Class-based dark-mode toggle (persisted; a11y-labelled).
     2. <meta name="theme-color"> kept in sync with the active MD3 surface.
     3. Mobile navigation menu (toggle, Escape-to-close, focus management).
     4. Data-driven project cards fetched from data/projects.json.
     5. Footer year.

   The FOUC-prevention script in index.html already sets the initial `.dark`
   class before first paint; this module only syncs accessory state and wires
   interactivity. Every selector referenced here exists verbatim in index.html.
   =========================================================================== */

/** Material surface colors, mirrored from style.css for the theme-color meta. */
const SURFACE = { light: '#f9f9ff', dark: '#111318' }

/* ---------------------------------------------------------------------------
   Theme toggle
   --------------------------------------------------------------------------- */
const root = document.documentElement
const toggle = document.getElementById('theme-toggle')
/* Select by attribute so the reference survives any HTML minification. */
const themeColorMeta = document.querySelector('meta[name="theme-color"]')

/**
 * Reflect the current theme onto the toggle's ARIA state + label and the
 * browser theme-color. The `.dark` class is the single source of truth.
 */
function syncThemeState() {
  const isDark = root.classList.contains('dark')
  if (toggle) {
    toggle.setAttribute('aria-pressed', String(isDark))
    toggle.setAttribute(
      'aria-label',
      isDark ? 'Switch to light theme' : 'Switch to dark theme',
    )
  }
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', isDark ? SURFACE.dark : SURFACE.light)
  }
}

toggle?.addEventListener('click', () => {
  const isDark = root.classList.toggle('dark')
  try {
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  } catch {
    /* Persistence is best-effort; ignore private-mode failures. */
  }
  syncThemeState()
})

// Follow the OS preference while the user hasn't made an explicit choice.
window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (event) => {
    let stored = null
    try {
      stored = localStorage.getItem('theme')
    } catch {
      /* ignore */
    }
    if (stored) return // An explicit choice wins over the OS setting.
    root.classList.toggle('dark', event.matches)
    syncThemeState()
  })

syncThemeState()

/* ---------------------------------------------------------------------------
   Mobile navigation menu
   --------------------------------------------------------------------------- */
const navToggle = document.getElementById('nav-toggle')
const mobileMenu = document.getElementById('mobile-menu')

/** Open/close the mobile menu and keep ARIA state in sync. */
function setMenu(open) {
  if (!navToggle || !mobileMenu) return
  navToggle.setAttribute('aria-expanded', String(open))
  mobileMenu.hidden = !open
}

navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') === 'true'
  setMenu(!open)
})

// Close the menu after activating any of its links.
mobileMenu?.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false)
})

// Escape closes the menu and returns focus to the toggle.
document.addEventListener('keydown', (event) => {
  if (
    event.key === 'Escape' &&
    navToggle?.getAttribute('aria-expanded') === 'true'
  ) {
    setMenu(false)
    navToggle.focus()
  }
})

/* ---------------------------------------------------------------------------
   Footer year
   --------------------------------------------------------------------------- */
const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = String(new Date().getFullYear())

/* ---------------------------------------------------------------------------
   Projects — fetched from data/projects.json and rendered as Material cards.
   Built with DOM APIs (not innerHTML) so user-editable JSON can't inject markup.
   --------------------------------------------------------------------------- */
const grid = document.getElementById('projects-grid')

/** Create an element with optional class names and text content. */
function el(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text != null) node.textContent = text
  return node
}

/** Small inline "open in new tab" arrow icon, matching the markup elsewhere. */
function externalIcon() {
  const NS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('class', 'h-4 w-4')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('stroke', 'currentColor')
  svg.setAttribute('stroke-width', '1.75')
  svg.setAttribute('stroke-linecap', 'round')
  svg.setAttribute('stroke-linejoin', 'round')
  svg.setAttribute('aria-hidden', 'true')
  const path = document.createElementNS(NS, 'path')
  path.setAttribute('d', 'M7 17 17 7M9 7h8v8')
  svg.appendChild(path)
  return svg
}

/** Build one Material elevated card for a project entry. */
function renderProjectCard(project) {
  const card = el('article', 'card-elevated flex h-full flex-col')

  card.appendChild(
    el(
      'h3',
      'text-lg font-medium text-on-surface',
      project.name || 'Untitled project',
    ),
  )

  if (project.description) {
    card.appendChild(
      el(
        'p',
        'mt-2 flex-1 text-sm leading-relaxed text-on-surface-variant',
        project.description,
      ),
    )
  }

  // Tags → Material assist chips.
  if (Array.isArray(project.tags) && project.tags.length) {
    const tagList = el('ul', 'mt-4 flex flex-wrap gap-2')
    tagList.setAttribute(
      'aria-label',
      `${project.name || 'Project'} technologies`,
    )
    for (const tag of project.tags) tagList.appendChild(el('li', 'chip', tag))
    card.appendChild(tagList)
  }

  // Links row: repo (when present) + live (only when truthy).
  const links = el(
    'div',
    'mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-outline-variant pt-4 text-sm',
  )

  if (project.repoUrl) {
    const repo = el('a', 'link-inline', 'Code')
    repo.href = project.repoUrl
    repo.target = '_blank'
    repo.rel = 'noopener noreferrer'
    repo.setAttribute(
      'aria-label',
      `${project.name || 'Project'} source code on GitHub`,
    )
    repo.appendChild(externalIcon())
    links.appendChild(repo)
  }

  if (project.liveUrl) {
    const live = el('a', 'link-inline', 'Live')
    live.href = project.liveUrl
    live.target = '_blank'
    live.rel = 'noopener noreferrer'
    live.setAttribute('aria-label', `${project.name || 'Project'} live site`)
    live.appendChild(externalIcon())
    links.appendChild(live)
  }

  if (links.childElementCount) card.appendChild(links)

  return card
}

/** Replace the grid contents with a single status message. */
function setStatus(message) {
  grid.replaceChildren(
    el('p', 'col-span-full font-mono text-sm text-on-surface-variant', message),
  )
}

async function loadProjects() {
  if (!grid) return

  grid.setAttribute('aria-busy', 'true')
  setStatus('Loading projects…')

  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/projects.json`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const projects = await response.json()

    if (!Array.isArray(projects) || projects.length === 0) {
      setStatus('No projects to show yet — browse my work on GitHub.')
      return
    }

    const fragment = document.createDocumentFragment()
    for (const project of projects)
      fragment.appendChild(renderProjectCard(project))
    grid.replaceChildren(fragment)
  } catch (error) {
    console.error('Failed to load projects:', error)
    setStatus(
      'Projects could not be loaded right now — browse my work on GitHub.',
    )
  } finally {
    // Reset on every path so the live region is never left perpetually busy.
    grid.setAttribute('aria-busy', 'false')
  }
}

loadProjects()
