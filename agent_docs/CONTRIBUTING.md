# Contributing

## Git Workflow

Submit PRs against `develop` branch (not `master`).

Sign off commits with DCO:
```
Signed-off-by: Your Name <your.email@example.com>
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

Format: `type(scope): message`

Scope is optional but recommended for clarity (e.g., `fix(webcam): ...`, `feat(console): ...`).

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `refactor` - Code refactoring
- `style` - Formatting changes
- `test` - Adding tests
- `chore` - Maintenance

## Before Submitting

```bash
npm run format
npm run lint:fix
npm run test:unit
```
