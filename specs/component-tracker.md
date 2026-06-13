# Component Tracker

Purpose: keep a simple, human-readable record of component audit progress and follow-up notes.

Source of truth for the full inventory:
- `specs/vuetify-component-audit.md`

Status legend:
- [x] reviewed and clean
- [ ] pending review
- [!] needs follow-up

Current state:
- Template-level legacy Vuetify prop scan is currently clean across all Vue SFCs under `src/`.
- Build verification has passed after the latest cleanup sweep.

## Notes

Use this file for quick progress updates while reviewing components.
Add one bullet per component or component group, then mark it with a status.

## Checklist format

- [x] `src/components/...` — reviewed, no legacy Vuetify template props found
- [ ] `src/components/...` — pending review
- [!] `src/components/...` — follow-up needed

## Follow-up log

- 2026-06-13 — Created tracker file to keep component review progress in one place.
