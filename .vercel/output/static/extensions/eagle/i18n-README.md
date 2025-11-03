# i18n Internationalization for Eagle2Ae_Eagle Extension

## Overview
This extension now supports Chinese and English languages with a language switch button in the UI.

## Features
- Toggle between Chinese and English languages
- Language preference is saved in localStorage
- All UI elements are properly localized
- Dynamic UI updates when language is changed

## Implementation Details

### Files Added
- `js/i18n.js` - Main internationalization system
- `test-i18n.html` - Test page for i18n functionality

### Files Modified
- `index.html` - Added i18n script, language switch button, and updated UI elements
- `js/plugin.js` - Updated log function to support i18n

### Key Features

#### Language Switch Button
- Added a globe icon button next to the settings button in the header
- Toggles between Chinese and English
- Shows current language as text (中文/EN) inside the button
- Button title shows the action to switch to the other language

#### Supported Languages
- Chinese (zh) - Default
- English (en)

#### Translation Keys
The system includes translations for:
- Main UI elements (titles, labels)
- Status messages
- Settings dialog
- Log messages
- Button texts
- Connection status indicators

#### Automatic Updates
- Language preference is saved and restored on app restart
- All UI elements update dynamically when language is changed
- The system gracefully handles missing translations by falling back to keys

## Usage

### For Developers
To add new translations:
1. Add the translation key and values to the `translations` object in `js/i18n.js`
2. Use `window.i18n.t('key')` to get the translated text
3. Use `window.i18n.t('key', {param: 'value'})` for parameterized translations

### For Users
1. Click the globe icon in the top right corner to switch languages
2. The language preference is remembered between sessions
3. All UI elements will update immediately to the selected language