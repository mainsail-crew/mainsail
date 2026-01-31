# Code Review

## How to Review

- Comment only when confidence >80% an issue exists
- One sentence per comment when possible
- Focus on changed files only
- Propose minimal fixes with line references

## Checklist

### Code Quality ([CODE_STYLE.md](CODE_STYLE.md))

- [ ] TypeScript types explicit and correct
- [ ] No unused variables, imports, or dead code
- [ ] Early returns used (no deep nesting)
- [ ] Functions follow single responsibility
- [ ] Magic numbers replaced with named constants

### Vue Components ([VUE_TYPESCRIPT.md](VUE_TYPESCRIPT.md))

- [ ] Uses Vue Class Component syntax
- [ ] Class member order correct (`@Prop` → Data → Getters → `@Watch` → Lifecycle → Methods
- [ ] `beforeDestroy` cleans up all resources
- [ ] Complex template logic extracted to computed properties

### UI & i18n ([UI_I18N.md](UI_I18N.md))

- [ ] All UI text uses `$t()`
- [ ] New strings in `en.json` alphabetically sorted
- [ ] Vuetify utility classes preferred over custom CSS

### Performance

- [ ] `@Debounce(ms)` on inputs triggering API calls
- [ ] `throttle()` on resize handlers
- [ ] No raw `console.log`
