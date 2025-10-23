# Project Structure

## Monorepo Organization

This is a pnpm workspace monorepo with the following structure:

```
eagle2ae-monorepo/
├── apps/                      # Application packages
│   ├── eagle2ae_web/         # Marketing/landing page (Vue 3 + Vite)
│   └── eagle2ae_docs/        # Documentation site (VitePress)
├── extensions/               # Plugin extensions (not in workspace)
│   ├── eagle/               # Eagle browser extension
│   └── ae/                  # After Effects CEP extension
├── resources/               # Project resources
│   ├── design/             # Design assets
│   ├── docs/               # Additional documentation
│   └── reference/          # Reference materials (gitignored)
├── .kiro/                   # Kiro AI assistant configuration
│   └── steering/           # AI steering rules
├── package.json            # Root package with workspace scripts
├── pnpm-workspace.yaml     # Workspace configuration
└── vercel.json            # Vercel deployment config
```

## Key Directories

### `/apps/*`
Workspace packages managed by pnpm. Each app has its own:
- `package.json` with dependencies
- Build configuration (Vite)
- Independent deployment capability

### `/extensions/*`
Standalone extensions not part of the pnpm workspace:
- **eagle**: Browser-based plugin for Eagle app
  - Entry: `index.html`, `service.html`
  - Backend: Node.js-style with `package.json`
  - Manifest: `manifest.json` for Eagle plugin system
- **ae**: CEP extension for After Effects
  - Entry: `index.html`
  - CEP config: `CSXS/manifest.xml`
  - Scripts: `js/` (JavaScript), `jsx/` (ExtendScript)
  - Installation helpers: `.reg` files for Windows

### `/resources/*`
Non-code assets:
- Design files and mockups
- Documentation sources
- Reference materials (excluded from git)

## Naming Conventions

- **Folders**: lowercase with underscores (`eagle2ae_web`, `eagle2ae_docs`)
- **Extensions**: lowercase (`eagle`, `ae`)
- **Package names**: Match folder names
- **Files**: 
  - Config files: lowercase with dots (`vite.config.js`)
  - Components: PascalCase (Vue convention)
  - Scripts: lowercase or camelCase

## Workspace Configuration

Only `apps/*` packages are in the workspace:
```yaml
packages:
  - 'apps/*'
```

Extensions are standalone and not managed by the workspace.

## Build Outputs

- **Web apps**: `dist/` directory (gitignored)
- **Extensions**: No build step - deployed as-is
- **Docs**: `.vitepress/dist/` (gitignored)

## Important Files

- `README.md` - Main project documentation (Chinese)
- `GEMINI.md` - AI assistant instructions (Chinese)
- `.gitignore` - Excludes node_modules, dist, build outputs, reference folder
- `vercel.json` - Deployment configuration for Vercel
