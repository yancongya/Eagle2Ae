# Product Overview

Eagle2Ae is a high-performance file transfer plugin that bridges Eagle (digital asset management tool) and Adobe After Effects.

## Core Purpose

Enables seamless image import from Eagle libraries directly into After Effects projects with minimal latency and intelligent connection management.

## Key Features

- **Ultra-fast connection**: Sub-300ms connection latency (99.8% performance improvement)
- **Smart notifications**: Real-time connection status feedback via Eagle notification system
- **Library monitoring**: Automatic detection of library changes with intelligent size updates
- **Pre-computation**: Library size pre-calculated on Eagle startup for instant AE connection
- **Dual-protocol support**: HTTP + Eagle-compatible WebSocket communication

## Architecture

Two-part system:
1. **Eagle Extension**: Browser-based plugin running inside Eagle app (port 8080)
2. **After Effects CEP Extension**: Adobe CEP panel extension for AE CC 2015+

## Target Users

Motion designers and video editors who use Eagle for asset management and need efficient workflows for importing assets into After Effects.
