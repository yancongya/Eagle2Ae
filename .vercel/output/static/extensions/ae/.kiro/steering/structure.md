# Project Organization & Folder Structure

## Root Level Files

- **index.html**: Main CEP panel interface with embedded CSS and initialization scripts
- **README.md**: Comprehensive installation and usage documentation (Chinese)
- **enable_cep_debug_*.reg**: Windows registry files for enabling CEP debug mode

## Core Directories

### `/CSXS/`
CEP extension configuration
- **manifest.xml**: Extension metadata, host compatibility, and CEP settings
  - Extension ID: `com.eagle.eagle2ae`
  - Supports After Effects CC 2015+ (CSXS 6-12)
  - Enables Node.js integration with `--enable-nodejs` flag

### `/js/` - Frontend JavaScript
Modular JavaScript architecture with clear separation of concerns:

#### Core Files
- **main.js**: Primary application controller and CEP interface management
- **CSInterface.js**: Adobe's official CEP interface library
- **websocket-client.js**: WebSocket communication handler

#### `/js/constants/`
- **ImportSettings.js**: Configuration constants, enums, and default settings

#### `/js/services/`
Business logic services:
- **SettingsManager.js**: User preferences and configuration management
- **FileHandler.js**: File import/export operations
- **ProjectStatusChecker.js**: After Effects project state monitoring
- **PortDiscovery.js**: Dynamic port detection for Eagle communication

#### `/js/utils/`
Utility functions:
- **LogManager.js**: Centralized logging system
- **SoundPlayer.js**: Audio feedback for user interactions

#### `/js/i18n/`
Internationalization support:
- **i18n.js**: Translation engine
- **zh-CN.json**: Chinese translations
- **en-US.json**: English translations
- **helpers.js**: Translation utilities

#### `/js/ui/`
UI-specific components:
- **summary-dialog.js**: Import summary dialog management

#### `/js/demo/`
Demo mode for development and testing:
- **demo-mode.js**: Standalone demo functionality
- **demo-*.js**: Various demo utilities and overrides

### `/jsx/` - ExtendScript Backend
Adobe ExtendScript files for After Effects automation:

#### Core Files
- **hostscript.jsx**: Main ExtendScript entry point with unified error management
- **dialog-warning.jsx**: Warning dialog system
- **dialog-summary.jsx**: Import summary dialogs
- **test-tooltip.jsx**: Tooltip testing utilities
- **compose.jsx**: Composition management utilities

#### `/jsx/utils/`
ExtendScript utilities:
- **folder-opener.js**: File system operations

### `/public/` - Static Assets
- **logo.png / logo2.png**: Extension branding assets
- **/sound/**: Audio files for user feedback

### `/.vercel/`
Deployment configuration (if applicable)

## Code Organization Patterns

### Naming Conventions
- **Classes**: PascalCase (`SettingsManager`, `FileHandler`)
- **Files**: kebab-case for components, PascalCase for classes
- **Constants**: UPPER_SNAKE_CASE (`STORAGE_KEYS`, `DEFAULT_SETTINGS`)
- **Functions**: camelCase (`loadSettings`, `validateSystemState`)

### Module Structure
- Each service class is self-contained with clear dependencies
- Constants are centralized in `/constants/` directory
- Utilities are pure functions without side effects
- UI components manage their own state and DOM interactions

### Error Handling
- Unified error management system in ExtendScript (`hostscript.jsx`)
- Centralized logging through `LogManager.js`
- Graceful fallbacks for missing dependencies or failed operations

### Communication Architecture
- CEP layer handles UI and HTTP/WebSocket communication
- ExtendScript layer handles After Effects API operations
- Clear separation between frontend logic and AE automation
- JSON-based message passing between layers

## File Dependencies

### Critical Path
1. `index.html` → `js/main.js` → `jsx/hostscript.jsx`
2. Settings flow: `SettingsManager.js` → `ImportSettings.js`
3. Communication: `main.js` → `websocket-client.js` → Eagle plugin

### Extension Points
- Add new import modes in `ImportSettings.js`
- Extend UI components in `/js/ui/`
- Add new ExtendScript operations in `/jsx/`
- Expand internationalization in `/js/i18n/`