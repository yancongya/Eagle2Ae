# Technology Stack

## Build System

- **Package Manager**: pnpm (workspace-based monorepo)
- **Monorepo Structure**: pnpm workspaces with apps in `apps/*`
- **Build Tool**: Vite (for web apps and docs)

## Tech Stack by Component

### Eagle Extension (`extensions/eagle`)
- **Runtime**: Browser-based (runs inside Eagle app)
- **Core Dependencies**:
  - `ws` (^8.18.3) - WebSocket server
  - `fs-extra` (^11.3.1) - File system operations
  - `@crosscopy/clipboard` (^0.2.8) - Clipboard management
- **Architecture**: HTTP server (port 8080) + WebSocket support

### After Effects Extension (`extensions/ae`)
- **Platform**: Adobe CEP (Common Extensibility Platform)
- **Languages**: 
  - HTML/CSS/JavaScript (UI layer)
  - ExtendScript JSX (AE host scripting)
- **Key Files**:
  - `CSInterface.js` - Adobe CEP interface library
  - `hostscript.jsx` - ExtendScript for AE integration
  - `manifest.xml` - CEP extension configuration
- **Compatibility**: CSXS 6-12 (AE CC 2015-2024+)

### Web App (`apps/eagle2ae_web`)
- **Framework**: Vue 3 (^3.5.22) with Composition API
- **Build Tool**: Vite (^7.1.7)
- **Styling**: Tailwind CSS (^3.4.17) + PostCSS
- **Key Libraries**:
  - `vue-router` (^4.5.1) - Routing
  - `vue-i18n` (^9.14.5) - Internationalization
  - `@vueuse/core` (^13.9.0) - Vue utilities
  - `gsap` (^3.13.0) - Animations
  - `matter-js` (^0.20.0) - Physics engine
  - `swiper` (^12.0.2) - Carousel/slider
  - `splitpanes` (^4.0.4) - Resizable split views

### Documentation (`apps/eagle2ae_docs`)
- **Framework**: VitePress (^1.0.0-rc.45)
- **Runtime**: Vue 3 (^3.4.21)
- **Analytics**: Vercel Analytics (^1.5.0)

## Common Commands

### Development
```bash
# Web app development
pnpm dev:web

# Documentation development
pnpm dev:docs
```

### Build
```bash
# Build web app
pnpm build:web

# Build documentation
pnpm build:docs
```

### Extension Development
Extensions are not built via npm scripts - they are deployed directly:
- Eagle extension: Copy to Eagle plugins directory
- AE extension: Copy to AE CEP extensions directory (requires CEP debug mode)

## Deployment

- **Platform**: Vercel (configured via `vercel.json`)
- **Web app**: Deployed from `apps/eagle2ae_web`
- **Docs**: Deployed from `apps/eagle2ae_docs`

## Language

Primary language: **Chinese (Simplified)**
- All documentation, UI text, and comments are in Chinese
- README and user-facing content in Chinese
