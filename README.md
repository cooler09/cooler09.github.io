# cooler09.github.io

Personal developer portfolio for **Zachary Lockhart** — Lead Software Engineer. A single-page site built with Vite and Tailwind CSS v4, styled with a hand-built Material 3 (Material You) design system.

**Live:** https://cooler09.github.io

## Stack

- **[Vite](https://vitejs.dev/)** — build tooling and dev server
- **[Tailwind CSS v4](https://tailwindcss.com/)** — utility styling
- **Material 3 design system** — hand-built, not a template

### Material 3 theming

The Material You look is implemented by hand:

- **MD3 color roles as CSS variables** — tokens like `--md-sys-color-primary`, `--surface`, `--on-surface`, etc. live in `src/style.css` and drive the whole palette.
- **Class-based dark mode** — a `dark` class on the root swaps the color-role variables, so light/dark themes share one source of truth.

## Project structure

```
.
├── src/
│   ├── index.html            # markup + content
│   ├── style.css             # MD3 color roles / palette + component styles
│   ├── main.js               # app entry / interactions
│   └── public/               # static assets copied as-is
│       ├── favicon.svg
│       ├── resume.pdf        # downloadable résumé
│       ├── .nojekyll         # disables Jekyll on GitHub Pages
│       └── data/
│           └── projects.json # portfolio content (edit this)
├── dist/                     # build output (generated)
└── .github/
    └── workflows/
        └── deploy.yml        # GitHub Actions → GitHub Pages
```

## Customize

Most updates don't require touching component code:

- **Projects** — edit `src/public/data/projects.json`. Each entry supports:

  | Field | Description |
  | --- | --- |
  | `name` | Project title |
  | `description` | Short summary |
  | `tags` | Array of tech/labels |
  | `repoUrl` | Link to source repo |
  | `liveUrl` | Link to live demo |

- **LinkedIn** — replace the `{{LINKEDIN_URL}}` placeholder in `src/index.html`.
- **Résumé** — swap `src/public/resume.pdf` (keep the filename to preserve the `/resume.pdf` link).
- **Palette / theme** — the MD3 color roles and design tokens live in `src/style.css`.

## Local development

```bash
npm install      # install dependencies
npm run dev      # start the Vite dev server
npm run build    # produce a production build in dist/
npm run preview  # preview the production build locally
```

## Deployment

Deploys to **GitHub Pages** via GitHub Actions:

1. Push to the **`master`** branch.
2. The workflow in `.github/workflows/deploy.yml` builds the site and publishes `dist/` to Pages.

**One-time setup:** in the repository, go to **Settings → Pages → Source** and select **GitHub Actions**.
