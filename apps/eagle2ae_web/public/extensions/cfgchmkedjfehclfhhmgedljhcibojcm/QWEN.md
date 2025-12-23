# QWEN.md - Eagle Browser Extension Analysis

## Project Overview

This directory contains the **Eagle Browser Extension** (version 3.1.22), a powerful tool designed to help users efficiently collect, organize, and save images, screenshots, and web bookmarks from web pages directly to the Eagle desktop application. Eagle is a popular asset management tool for designers and creative professionals.

This is a **JavaScript-based browser extension** that follows the **Chrome Extension Manifest V3** specification. The core frontend framework is **AngularJS (v1)**, and it uses a modular architecture with a global `eagle` namespace to organize functionality. The extension features a plugin system for deep integration with specific websites (Pinterest, Behance, Twitter, etc.) to provide optimized element extraction.

### Key Features
- **Drag & Drop Saving**: Save images by dragging them directly to the Eagle app icon
- **Batch Image Saving**: Collect multiple images from a webpage at once
- **Screenshot Capture**: Capture selected areas, visible portions, or entire web pages
- **URL Saving**: Save web pages as bookmarks with thumbnails
- **Context Menu Integration**: Right-click options for saving content
- **Website-Specific Plugins**: Optimized support for popular platforms
- **Custom Collection Window**: Rich UI for organizing collected items with tags, ratings, and annotations

### Main Technologies
- **Core**: JavaScript (ES6+), HTML5, CSS3
- **Framework**: AngularJS (v1)
- **Extension API**: Chrome Extension Manifest V3
- **Third-party libraries**: jQuery, SweetAlert2, Mousetrap, Tippy.js, Popper.js

## Building and Running

Since this is an unpacked extension, there are no traditional build steps. To run and debug:

1. Open your Chromium-based browser (Chrome, Edge, etc.) and navigate to `chrome://extensions` (or `edge://extensions`)
2. Enable **"Developer mode"** in the top-right corner
3. Click the **"Load unpacked"** button
4. Select the `3.1.22_0` directory (or the version directory containing `manifest.json`)
5. The extension will be loaded and active. Changes to source files can be reloaded by clicking the refresh icon in the extensions page

## Architecture and Development Conventions

### Code Structure
- **`manifest.json`**: Extension entry point defining background scripts, content scripts, permissions, and plugin rules
- **`js/`**: Core JavaScript logic
  - **`js/background-v3.js`**: Service worker background script handling non-page tasks
  - **`js/content.js`**: Main content script injected into web pages for drag/drop and context menu functionality
  - **`js/lib/`**: Core API modules (like `eagle.js`) and feature implementations (e.g., `drag-saver.js`, `cropper.js`)
  - **`js/vendors/`**: Third-party libraries (jQuery, AngularJS, etc.)
- **`popup/`**: Extension popup UI using AngularJS with controllers for different functions
- **`collect-window/`**: Custom collection interface for organizing collected items
- **`plugins/`**: Site-specific plugins with optimized content scripts for various websites
- **`_locales/`**: Internationalization files with `messages.json` for different languages
- **`css/`**: Shared stylesheets used across the extension

### Architecture Patterns
- **AngularJS MVVM**: The popup and collection windows use AngularJS with MVVM pattern, with data binding through directives
- **Modular Namespace**: Features are encapsulated in the global `eagle` namespace to avoid global pollution
- **Plugin Architecture**: Different content scripts are registered for specific domains in `manifest.json` for targeted functionality
- **Event-Driven**: Interactions handled through event listeners in modules like `DragSaver` and `ContextSaver`
- **Client-Server Communication**: The extension communicates with the Eagle desktop app via HTTP requests to `localhost:41593` and `localhost:41595`

### Key Functionality
- **Image Collection**: Extracts image URLs from web pages and sends them to Eagle desktop app
- **URL Enlargement**: Attempts to find higher-resolution versions of images before saving
- **Batch Processing**: Collects multiple images from a page simultaneously
- **Screenshot Capture**: Uses browser APIs to capture selected areas or full pages
- **Drag & Drop Interface**: Provides a floating UI element for drag operations
- **Custom Metadata**: Allows adding titles, annotations, tags, and star ratings to collected items

### Plugin System Architecture
The extension uses a sophisticated plugin system to provide optimized functionality for specific websites:

- **SitePlugin Base Class**: All plugins extend the `SitePlugin` base class defined in `js/lib/api/plugin.js`
- **Registration**: Plugins are registered using `eagle.plugin.register(domainRegex, pluginInstance)`
- **Manifest Integration**: Each plugin is loaded via `manifest.json` with specific domain match patterns
- **Key Methods**:
  - `inject()`: Initializes plugin-specific functionality (DOM observation, event handling)
  - `getMeta(element)`: Extracts metadata (title, link, etc.) from page elements
  - `getMetaAsync(element)`: Async version for complex metadata extraction (e.g. API calls)
  - `disableBatchSaver`: Boolean flag to control batch saving behavior on the site

**Example Plugin Structure**:
```javascript
class ExamplePlugin extends SitePlugin {
  disableBatchSaver = false;  // Enable/disable batch saving

  inject() {
    // Initialize plugin-specific functionality
    // Set up DOM observers, event listeners, etc.
  }

  getMeta(element) {
    // Extract basic metadata from the element
    // Return an object with title, link, etc.
  }

  async getMetaAsync(element) {
    // For complex metadata extraction (API calls, etc.)
    // Return a promise with metadata object
  }
}
```

**How Plugins Are Loaded**:
1. Each plugin script registers itself with a domain regex pattern
2. The plugin's `inject()` method is called to initialize site-specific functionality
3. When collecting elements, the extension checks for applicable plugins
4. Plugin's `getMeta()` or `getMetaAsync()` methods are called to extract metadata
5. Plugin-specific behavior (like disabling batch saver) is applied

### Development Notes
- The extension communicates with the Eagle desktop application through local HTTP endpoints
- Site-specific plugins extend functionality for platforms like Pinterest, Twitter, Instagram, etc.
- The extension supports multiple languages through the `_locales` directory
- Preferences are stored using Chrome's sync storage API
- The extension uses a combination of content scripts and background service workers to handle different types of operations

## Key Files and Components

- **`manifest.json`**: Defines extension permissions, content scripts, and plugin configurations
- **`js/lib/api/item.js`**: Core logic for adding files to Eagle with various metadata
- **`js/lib/api/preference.js`**: Handles user preferences and settings management
- **`popup/popup.html`**: Main UI for the extension with options for saving and capturing
- **`collect-window/index.html`**: Custom interface for organizing collected items before saving
- **`plugins/*/`**: Site-specific implementations for enhanced functionality on popular platforms
- **`js/content.js`**: Main content script handling drag/drop and context menu operations
- **`js/background-v3.js`**: Background service worker initialization and management

## Usage Context

This extension is specifically designed to work with the Eagle desktop application, which must be running for the extension to function. The extension serves as a bridge between web browsing and the Eagle asset management system, allowing users to quickly capture and organize visual content for creative projects.