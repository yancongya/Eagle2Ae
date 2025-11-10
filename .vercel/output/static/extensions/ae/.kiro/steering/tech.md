# Technology Stack & Build System

## Core Technologies

- **CEP (Common Extensibility Platform)**: Adobe's framework for creating extensions
- **ExtendScript**: Adobe's JavaScript engine for After Effects automation
- **HTML5/CSS3/JavaScript**: Modern web technologies for the UI
- **WebSocket/HTTP**: Real-time communication protocols

## Architecture

### Frontend (CEP Panel)
- **HTML**: Single-page application (`index.html`)
- **CSS**: Custom styling with dark theme support
- **JavaScript ES5/ES6**: Main application logic in `js/main.js`
- **CSInterface.js**: Adobe's CEP interface library

### Backend (ExtendScript)
- **JSX Files**: ExtendScript scripts in `jsx/` folder
- **hostscript.jsx**: Main ExtendScript entry point
- **Dialog System**: Custom dialog components for user interaction

### Communication Layer
- **WebSocket Client**: `js/websocket-client.js` for real-time communication
- **HTTP Polling**: Fallback communication method
- **Port Discovery**: Dynamic port detection (8080-8089)

## Project Structure

```
Eagle2Ae/
├── CSXS/manifest.xml          # CEP extension manifest
├── index.html                 # Main UI entry point
├── js/
│   ├── main.js               # Core application logic
│   ├── CSInterface.js        # Adobe CEP interface
│   ├── constants/            # Configuration constants
│   ├── services/             # Business logic services
│   ├── utils/                # Utility functions
│   └── i18n/                 # Internationalization
├── jsx/
│   ├── hostscript.jsx        # Main ExtendScript file
│   ├── dialog-*.jsx          # UI dialog components
│   └── utils/                # ExtendScript utilities
└── public/                   # Static assets (images, sounds)
```

## Build System

**No Build Process Required** - This is a vanilla JavaScript CEP extension that runs directly without compilation:

- No package.json or npm dependencies
- No webpack, rollup, or other bundlers
- Direct file serving from extension directory
- Manual installation via file system copy

## Development Commands

### Installation
```bash
# Windows - Copy to CEP extensions directory
xcopy /E /I Eagle2Ae "%APPDATA%\Adobe\CEP\extensions\com.eagle.eagle2ae\"

# macOS - Copy to CEP extensions directory  
cp -R Eagle2Ae ~/Library/Application\ Support/Adobe/CEP/extensions/com.eagle.eagle2ae/
```

### Enable CEP Debug Mode
```bash
# Windows - Run registry file
enable_cep_debug_mode.reg

# macOS - Terminal commands
defaults write com.adobe.CSXS.11 PlayerDebugMode 1
defaults write com.adobe.CSXS.12 PlayerDebugMode 1
```

### Testing
- Manual testing within After Effects
- Debug via Chrome DevTools (CEP debug mode)
- ExtendScript debugging via After Effects ExtendScript Toolkit

## Key Libraries & Dependencies

- **CSInterface.js**: Adobe's official CEP interface library
- **No external npm packages**: Self-contained vanilla JavaScript
- **Built-in APIs**: Uses native browser APIs and Adobe ExtendScript APIs