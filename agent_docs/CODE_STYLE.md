# Code Style

## Formatting

Prettier enforces: 4-space indent, single quotes, no semicolons, 120 char width.

See [CONTRIBUTING.md](CONTRIBUTING.md) for commands.

## Naming

- **PascalCase** - Components, classes, types, interfaces
- **camelCase** - Functions, variables, methods

### Vuex Getters

Name getters by how they are used:

- **Property-style getters** (return a value) - nouns, no `get` prefix: `allGcodeFiles`, `sidebarLogoUrl`
- **Method-style getters** (return a function) - verbs: `getFile(path)`, `getDirectory(path)`
- **Boolean getters** - `is`, `has` or `...Exists`: `isDirectoryLoaded(path)`, `hasConfigFile(name)`, `pathExists(path)`

Avoid vague verbs like `check...`. Return `null` when nothing is found, not `''` or `undefined`.
Annotate the return type of every getter.

> Older store modules still use the `get` prefix for property-style getters. Use this convention for new and refactored modules.

## Nullish Handling

Use `??` for default values (checks null/undefined only):

```typescript
const value = input ?? 'default'
```

Use `||` only when checking all falsy values.

## No Dead Code

Remove unused variables, imports, and commented-out code immediately.

## Comments

Explain "why", not "what". Code should be self-documenting.

## Early Returns

Use guard clauses to avoid deep nesting:

```typescript
function process(item) {
  if (!item) return
  if (!item.isValid) return
  // main logic here
}
```

## Single Responsibility

Functions should do one thing.
Consider refactoring if exceeding 20-30 lines.

## Magic Numbers

Use named constants:

```typescript
const STATUS_PRINTING = 3
if (status === STATUS_PRINTING) { ... }
```

## Performance

Use `@Debounce(ms)` for inputs triggering API calls.
Use `throttle()` for resize handlers.

## Console Logging

No raw `console.log` in production code.

For debug output, define a class method with a descriptive prefix:

```typescript
log(msg: string, obj?: unknown): void {
    const message = `[MyFeature] ${msg}`
    if (obj) {
        window.console.log(message, obj)
        return
    }
    window.console.log(message)
}
```
