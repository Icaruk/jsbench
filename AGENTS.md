# JSBench — Agent Instructions

## Commands

| Command               | Description                        |
| --------------------- | ---------------------------------- |
| `pnpm dev`            | Start dev server (port 5173)       |
| `pnpm build`          | Production build (static)          |
| `pnpm preview`        | Preview production build           |
| `pnpm check`          | Svelte type checking               |
| `pnpm test`           | Run Playwright tests (chromium)    |
| `pnpm test:ui`        | Playwright UI mode                 |
| `pnpm test:screenshots` | Screenshot tests                 |
| `pnpm knip`           | Find unused exports/files          |
| `pnpm deploy`         | Build + deploy to Cloudflare Pages |

Always run `pnpm build` after changes to verify no errors.

## Architecture

SPA built with SvelteKit (`adapter-static`, fallback `index.html`). Single page, no routing.
All benchmarking runs client-side in Web Workers — no server required.

### Directory Structure

```
src/
├── app.html                         HTML shell
├── lib/
│   ├── assets/                      favicon.svg, og-image.png
│   ├── components/                  UI components (see below)
│   ├── styles/
│   │   └── utilities.css            Global utility classes
│   ├── worker/
│   │   └── benchmark.worker.js      Web Worker for benchmark execution
│   ├── constants.js                 Default values (setup code, iterations, etc.)
│   ├── serializer.js                LZ-string encode/decode for URL hash sharing
│   └── state.svelte.js              AppState class (Svelte 5 runes, singleton)
├── routes/
│   ├── +layout.svelte               Imports layout.css
│   ├── +page.svelte                 Main page, composes all components
│   └── layout.css                   CSS variables + @import tailwindcss + utilities.css
```

### Data Flow

1. URL hash → `serializer.decode()` → initial state
2. User edits → reactive state → `syncHash()` (debounced 1.5s)
3. Run benchmark → `_createWorker()` → Web Worker executes
4. Worker posts `progress` / `result` / `error` messages → state updates → UI re-renders

## State Management

`AppState` class in `state.svelte.js` — uses Svelte 5 runes.
Shared singleton: `import { state as bench } from "$lib/state.svelte.js"`.

Key reactive properties:
- `setupCode`, `testCases`, `iterations`, `minTime`, `parallel`, `title` — user inputs
- `results` — benchmark output (array of `{ iterationSize, results: [{ name, opsPerSec }] }`)
- `running`, `progress`, `progressCurrent`, `progressTotal` — run state
- `previewResult`, `previewError`, `previewRunning` — preview state
- `completions` — auto-completion data extracted from preview result

Key methods:
- `syncHash()` — serialize state to URL hash
- `getShareableURL()` — full URL with compressed hash
- `addTestCase()`, `removeTestCase(id)`, `moveTestCase(from, to)`
- `runBenchmark()` — dispatches to `_runSequential()` or `_runParallel()`
- `runPreview()` — runs setup with N=1, returns variables
- `getEstimatedTime()` — estimated run duration in seconds

## Worker Architecture

`benchmark.worker.js` handles two message types:

### `preview` — runs setup code with $N=1
- Replaces `$N` → `1` in setup code
- Executes via `new Function(setupCode)()`
- Returns `{ type: 'preview-result', data }` or `{ type: 'preview-error', message }`

### `run` — runs full benchmark
For each iteration size N:
1. Replace `$N` → N in setup code
2. Execute setup via `new Function(resolvedSetup)()` → returns context object
3. Extract keys/values from context (`Object.keys`, `Object.values`)
4. For each test case:
   - Warmup phase: run for `warmup` ms (default 500ms)
   - Measure phase: run for `minTime` ms (default 1000ms)
   - Calculate ops/sec
5. Post `progress` messages during execution

Parallel mode: distributes test cases across `navigator.hardwareConcurrency` workers,
merges results by iteration size after all complete.

## Components

| Component          | Purpose                                               |
| ------------------ | ----------------------------------------------------- |
| `SectionTitle`     | Section heading with accent color + horizontal line   |
| `IterationConfig`  | Title, iteration sizes, min time inputs               |
| `SetupEditor`      | Setup code editor, preview, snippets modal            |
| `CodeEditor`       | CodeMirror wrapper (JS, oneDark, autocomplete)        |
| `TestCaseList`     | Draggable list of test cases, "Add Test Case" button  |
| `TestCase`         | Single test case: name input + code editor + delete   |
| `ActionBar`        | Serial/Parallel toggle, Run button, error display     |
| `SnippetsModal`    | Copyable code snippets for setup (Array, Set, Map...) |
| `ResultsChart`     | Chart.js bar chart of ops/sec results                 |

## Styling

### CSS Variables (`layout.css`)

All design tokens use CSS custom properties with namespaced names:
- **Spacing:** `--space-1` (4px) through `--space-7` (48px)
- **Radius:** `--radius-sm` (4px), `--radius-md` (8px), `--radius-lg` (12px)
- **Colors:** `--color-{role}` with variants `-bg`, `-border`, `-hover` (e.g. `--color-accent`, `--color-accent-bg`)
  - Surface: `bg`, `surface`, `surface-raised`
  - Text: `text`, `text-secondary`, `text-muted`, `text-dim`
  - Semantic: `accent` (blue), `success` (green), `warn` (yellow), `error` (red)
  - Mode: `serial` (blue), `parallel` (orange)
  - Border: `border`, `border-subtle`
- **Fonts:** `--font-{size}` (xs through heading), `--font-sans`, `--font-mono`
- **Line heights:** `--lh-{size}` (xs through xl)

### Global Utilities (`src/lib/styles/utilities.css`)

Always prefer these global classes over duplicating scoped CSS:

| Class                  | Purpose                                  | Used in                                    |
| ---------------------- | ---------------------------------------- | ------------------------------------------ |
| `.card`                | Bordered container with rounded corners  | SetupEditor, TestCase, ResultsChart, +page |
| `.bar`                 | Flex row with padding + raised bg        | SetupEditor, TestCase, SnippetsModal       |
| `.bar--between`        | `justify-content: space-between`         | (with .bar)                                |
| `.bar--border-bottom`  | Bottom border modifier                   | (with .bar)                                |
| `.bar--border-top`     | Top border modifier                      | (with .bar)                                |
| `.btn--accent`         | Primary accent button (blue)             | ActionBar, SetupEditor                     |
| `.btn--accent-sm`      | Small accent button                      | SnippetsModal                              |
| `.btn--success-ghost`  | Dashed green ghost button                | TestCaseList                               |
| `.btn--success-ghost-sm` | Small dashed green ghost button        | SetupEditor                                |
| `.btn--warn`           | Yellow/warning button                    | +page (share)                              |
| `.btn--serial`         | Serial/Parallel toggle button            | ActionBar                                  |
| `.btn--delete`         | Transparent → red on hover delete button | TestCase                                   |
| `.btn--icon`           | Bare icon button (no bg/border)          | SnippetsModal                              |
| `.text-muted-mono`     | Small muted monospace text               | SetupEditor, IterationConfig, +page        |
| `.error-block`         | Error message with red bg                | ActionBar, SetupEditor                     |
| `.error-block--bordered` | Bordered variant                       | ActionBar                                  |
| `.input`               | Monospace input field                    | IterationConfig                            |
| `.code-block`          | Code container with dark bg              | SnippetsModal                              |

When adding new UI elements, check `utilities.css` first. If a pattern is reused ≥2 times, extract it there.

## Conventions

- **Language:** JavaScript only (`.js` / `.svelte`), no TypeScript
- **Svelte 5 runes mode:** forced via `svelte.config.js` — always use `$state()`, `$derived()`, `$effect()`, `$props()`, `$bindable()`
- **Props:** `let { prop1, prop2 } = $props();`
- **No comments** in code unless explicitly requested
- **No emoji** in commit messages or code unless explicitly requested
- **Component structure:** `<script>` → markup → `<style>` (scoped)
- **CSS:** Use global utility classes first, scoped styles only for component-specific needs
- **Imports:** Use `$lib/` aliases, not relative paths across directories
- **State:** All app state lives in `AppState` singleton — components don't hold business logic

## Testing

- Playwright e2e tests in `tests/`
- `benchmark.spec.js` — functional tests
- `screenshots.spec.js` — visual regression
- Run: `pnpm test` (chromium only), `pnpm test:ui` (Playwright UI)
