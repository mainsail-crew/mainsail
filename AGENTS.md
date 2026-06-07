# AGENTS.md

This file documents the current state and capabilities of AI agents used in this project.

## Gemini CLI Agent

- **Purpose**: Interactive CLI agent specializing in software engineering tasks for this project.
- **Current Role**: Assisted with frontend development (Mainsail fork), including debugging rendering issues, implementing panels, defining Moonraker agent state contract, and settings persistence strategy.
- **Access**: Has access to shell commands, file system manipulation, and Chrome DevTools.
- **Context**: Maintains a context of the project's `IMPLEMENTATION_PLAN.md`, `PRODUCT.md`, `DESIGN.md`, and other relevant project documentation.

### Operational Guidelines

- **Dev Server Management**: Always run the development server within a `tmux` session. Before starting a new server, check for existing `tmux` sessions. If a relevant session is found, attempt to connect to it; otherwise, create a new one.
- **Hot Module Reload (HMR)**: The frontend development server supports Hot Module Reload. This means that after code changes, the browser page will update automatically without requiring a manual refresh. This should be taken into account during validation on the browser.
- **Package Manager**: This project uses **Bun** instead of npm. Use `bun install` for dependencies, `bun run <script>` for project scripts, and `bunx <tool>` for one-off CLI tools. Do not commit `package-lock.json`; Bun's lockfile is `bun.lock` / `bun.lockb`.

