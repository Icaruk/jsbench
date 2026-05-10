# JSBench — JavaScript Benchmarking Tool

Compare JavaScript performance at scale.  
Pit methods head-to-head across different input sizes and see which pattern wins. 
All running client-side with Web Workers for accurate, noise-free results.

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