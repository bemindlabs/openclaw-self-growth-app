# Definition of Done

## Code Complete
- [ ] Feature implemented per acceptance criteria
- [ ] No TODO/FIXME left in new code
- [ ] Error handling for user-facing operations

## Testing
- [ ] Vitest tests for new frontend components/pages
- [ ] Tests pass locally (`pnpm test` — 270+ tests)
- [ ] Rust compiles without errors (`cargo check`)

## Code Quality
- [ ] TypeScript type check passes (`tsc --noEmit`)
- [ ] Clippy passes with no warnings (`cargo clippy -- -D warnings`)
- [ ] No new bundle size regression (< 900KB main chunk)

## Review
- [ ] Self-reviewed diff before commit
- [ ] Pre-commit hook passes
- [ ] Pre-push hook passes

## Deployment
- [ ] CI pipeline passes (Quality Gate + Rust Check)
- [ ] Production build succeeds (`pnpm tauri build`)
