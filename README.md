# wraith-devices

> **Authorized use only.** This module is part of [Wraith](https://github.com), an educational security research tool. Do not use against systems without explicit permission. See the [LICENSE](../../LICENSE) for details.

Device enumerator module for Wraith.

## What it does

- Enumerates cameras, microphones, and speakers via `navigator.mediaDevices.enumerateDevices()`
- Prompts the target for audio/camera permission to reveal device labels
- Tracks permission request attempts with timestamps and outcomes (granted, denied, unavailable)
- Supports retry after denial

## UI

- **Panel**: device counts, permission request buttons (Audio / Camera) with status feedback, attempt history log with color-coded results and response times, and a "Refresh Devices" button for re-enumeration
- **View**: device table (kind, label, group ID), permission attempt history table, and CSV/JSON export

## Capture

| Type | ID | Persist | Description |
|------|----|---------|-------------|
| poll | `device-enum` | yes | Polls every 1s until enumeration completes, then stops |

## Commands

| ID | Description |
|----|-------------|
| `re-enumerate` | Trigger a fresh device enumeration without requesting permissions |
| `request-audio` | Prompt `getUserMedia({audio})`, re-enumerate on grant to reveal labels |
| `request-camera` | Prompt `getUserMedia({video})`, re-enumerate on grant to reveal labels |

## Install

Register in `server/src/index.ts` and `ui/src/main.tsx`. See the main Wraith README for details.
