# Eagle2Ae - After Effects CEP Extension

Eagle2Ae is a CEP (Common Extensibility Platform) extension for Adobe After Effects that provides seamless integration with Eagle, a digital asset management application. The extension enables users to import assets directly from Eagle into After Effects projects with advanced configuration options.

## Core Features

- **Asset Import**: Direct import of images, videos, audio files, and other media from Eagle to After Effects
- **Real-time Communication**: HTTP/WebSocket communication between Eagle plugin and AE extension
- **Project Integration**: Smart project detection and composition management
- **File Management**: Flexible import modes (direct, project-adjacent, custom folder)
- **Clipboard Support**: Import assets directly from clipboard with drag-and-drop functionality
- **Multilingual Support**: Chinese (zh-CN) and English (en-US) interface
- **Settings Management**: Comprehensive user preferences and import configuration

## Target Users

- Motion graphics designers using After Effects
- Video editors who manage assets with Eagle
- Creative professionals working with large media libraries
- Teams requiring streamlined asset workflows

## Technical Context

This is a CEP extension that runs inside After Effects, communicating with a companion Eagle plugin via HTTP/WebSocket on localhost port 8080-8089. The extension provides a panel interface within AE for managing imports and monitoring connection status.