/* =============================================================
   Zachary Lockhart — Portfolio interactions
   - Theme toggle (persisted, respects system preference)
   - Mobile navigation toggle
   - Project cards rendered from JSON (single source of truth)
   Vanilla JS, no dependencies. Runs with <script defer>.
   ============================================================= */

(function () {
  'use strict';

  /* -----------------------------------------------------------
     Theme toggle
     The pre-paint inline script in <head> already applied the
     correct theme; here we wire the button and keep it in sync.
     ----------------------------------------------------------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById('theme-toggle');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeToggle) {
      var isDark = theme === 'dark';
      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.setAttribute(
        'aria-label',
        isDark ? 'Switch to light theme' : 'Switch to dark theme'
      );
    }
    // Keep the browser UI (address bar) color in sync with the runtime theme.
    var meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', theme === 'dark' ? '#0f1115' : '#ffffff');
  }

  // Initialise button state from whatever the inline script set.
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try {
        localStorage.setItem('theme', next);
      } catch (e) {
        /* localStorage unavailable (e.g. private mode); non-fatal */
      }
    });
  }

  // Respond to OS theme changes only when the user hasn't chosen explicitly.
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  var onSchemeChange = function (event) {
    var hasSaved = false;
    try {
      hasSaved = localStorage.getItem('theme') !== null;
    } catch (e) {
      /* ignore */
    }
    if (!hasSaved) {
      applyTheme(event.matches ? 'dark' : 'light');
    }
  };
  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', onSchemeChange);
  }

  /* -----------------------------------------------------------
     Mobile navigation toggle
     ----------------------------------------------------------- */
  var navToggle = document.getElementById('nav-toggle');
  var navMenu = document.getElementById('nav-menu');

  function setNavOpen(open) {
    if (!navToggle || !navMenu) return;
    navMenu.setAttribute('data-open', String(open));
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute(
      'aria-label',
      open ? 'Close navigation menu' : 'Open navigation menu'
    );
  }

  if (navToggle && navMenu) {
    setNavOpen(false);

    navToggle.addEventListener('click', function () {
      var isOpen = navMenu.getAttribute('data-open') === 'true';
      setNavOpen(!isOpen);
    });

    // Close the menu after choosing a destination.
    navMenu.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        setNavOpen(false);
      }
    });

    // Close on Escape for keyboard users.
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navMenu.getAttribute('data-open') === 'true') {
        setNavOpen(false);
        navToggle.focus();
      }
    });
  }

  /* -----------------------------------------------------------
     Footer year
     ----------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* -----------------------------------------------------------
     Projects: fetch JSON and render cards
     ----------------------------------------------------------- */
  var grid = document.getElementById('projects-grid');

  // Small helper to build elements without innerHTML (safe from HTML injection).
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function showStatus(message, isError) {
    if (!grid) return;
    grid.innerHTML = '';
    var status = el('p', 'projects-status', message);
    if (isError) status.classList.add('is-error');
    grid.appendChild(status);
    grid.setAttribute('aria-busy', 'false');
  }

  // Inline SVG icons reused across cards.
  function svgIcon(paths) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'icon icon-inline');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    paths.forEach(function (d) {
      var path = document.createElementNS(ns, 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'currentColor');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(path);
    });
    return svg;
  }

  function buildLink(href, label, iconPaths) {
    var a = el('a', 'project-link');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.appendChild(svgIcon(iconPaths));
    a.appendChild(document.createTextNode(label));
    return a;
  }

  function buildProjectCard(project) {
    var card = el('article', 'card project-card');

    // Head: name + decorative glyph
    var head = el('div', 'project-head');
    head.appendChild(el('h3', 'project-name', project.name || 'Untitled project'));

    var glyph = el('span', 'project-glyph');
    glyph.setAttribute('aria-hidden', 'true');
    glyph.appendChild(
      svgIcon(['M4 18l6-6-6-6', 'M12 20h8'])
    );
    head.appendChild(glyph);
    card.appendChild(head);

    // Description
    if (project.description) {
      card.appendChild(el('p', 'project-desc', project.description));
    }

    // Tags -> chips
    if (Array.isArray(project.tags) && project.tags.length) {
      var tagList = el('ul', 'project-tags');
      tagList.setAttribute('aria-label', 'Technologies');
      project.tags.forEach(function (tag) {
        tagList.appendChild(el('li', 'chip', String(tag)));
      });
      card.appendChild(tagList);
    }

    // Links: repo (always if present) + live (only when provided)
    var links = el('div', 'project-links');

    if (project.repoUrl) {
      links.appendChild(
        buildLink(project.repoUrl, 'Code', [
          'M9 19c-4 1.5-4-2.5-6-3',
          'M16 22v-3.2a2.8 2.8 0 0 0-.8-2.2c2.6-.3 5.4-1.3 5.4-5.9a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C11.4 1.8 10.4 2.1 10.4 2.1a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 9 8.5c0 4.6 2.8 5.6 5.4 5.9a2.8 2.8 0 0 0-.8 2.1V22'
        ])
      );
    }

    if (project.liveUrl) {
      links.appendChild(
        buildLink(project.liveUrl, 'Live', ['M7 17 17 7', 'M9 7h8v8'])
      );
    }

    if (links.childNodes.length) {
      card.appendChild(links);
    }

    return card;
  }

  function renderProjects(projects) {
    if (!grid) return;

    if (!Array.isArray(projects) || projects.length === 0) {
      showStatus('No projects to show yet — check back soon.', false);
      return;
    }

    var fragment = document.createDocumentFragment();
    projects.forEach(function (project) {
      if (project && typeof project === 'object') {
        fragment.appendChild(buildProjectCard(project));
      }
    });

    grid.innerHTML = '';
    grid.appendChild(fragment);
    grid.setAttribute('aria-busy', 'false');
  }

  function loadProjects() {
    if (!grid) return;

    // Relative path so it resolves correctly when served from the site root.
    fetch('./assets/data/projects.json', { cache: 'no-cache' })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }
        return response.json();
      })
      .then(renderProjects)
      .catch(function (error) {
        // Never crash to a blank section; show a friendly, actionable message.
        showStatus(
          'Projects could not be loaded right now. Meanwhile, see my work on GitHub: github.com/cooler09',
          true
        );
        if (window.console && console.error) {
          console.error('Failed to load projects:', error);
        }
      });
  }

  loadProjects();
})();
