# JSBench — JavaScript Benchmarking Tool

JSBench is a high-performance JavaScript benchmarking tool designed to compare multiple code patterns across varying input sizes.
It executes user-provided code in a clean, isolated environment to provide accurate performance metrics without UI thread interference.

[https://jsbench.icaruk.dev/](https://jsbench.icaruk.dev/)

![app view](static/screenshot-app.png)

## Features

- Setup code that runs before each benchmark
- Configurable iteration sizes (e.g. 10, 100, 500, 2000)
- Results displayed as ops/sec with percentage difference from fastest
- Interactive chart visualizing performance across sizes
- Share benchmarks via URL hash
- Web Worker execution with warmup phase, parallel and serial modes
- Drag-and-drop test case reordering
- Configurable minimum run time per test

## How It Works

### Setup code

The setup code runs **once per iteration size** and must return an object. The `$N` placeholder is replaced with the current iteration size:

```js
const arr = Array.from({ length: $N }, (_, i) => i);
return { arr };
```

Internally, this is executed as:

```js
const context = new Function(setupCode)();
```

### Test cases

Each test case receives the variables returned by the setup code as **function parameters**. Under the hood:

```js
const keys = Object.keys(context);    // ['arr']
const values = Object.values(context); // [[0, 1, 2, ...]]

const fn = new Function(...keys, testCaseCode);
fn(...values);
```

So if the setup returns `{ arr }`, the test case code can use `arr` directly:

```js
const unique = [...new Set(arr)];
```

The setup result is shared by reference across all test cases for the same iteration size — it runs only once, not once per test case.

### Isolation

- All code runs inside **Web Workers**, completely off the UI thread.
- Each test case is compiled into its own `new Function(...)` — no shared scope between test cases.
- In **parallel mode**, test cases are distributed across multiple workers. Each worker runs the setup independently, so each worker gets its own isolated context.
- In **serial mode**, a single worker runs all test cases sequentially, sharing the same setup context.

### Measurement

For each (iteration size × test case) combination:

1. **Warmup phase** (500ms) — runs the function repeatedly to let the JIT compiler optimize.
2. **Measurement phase** (configurable, default 1000ms) — counts how many times the function executes.
3. **Result** — `ops/sec = (operations / elapsed_ms) × 1000`.