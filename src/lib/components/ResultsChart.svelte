<script>
  import { Chart, registerables } from "chart.js";
  import { onMount, onDestroy } from "svelte";

  Chart.register(...registerables);

  let { results = [] } = $props();
  let canvasEl;
  let chart;

  function css(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  $effect(() => {
    if (!canvasEl || !results || results.length === 0) return;
    renderChart(results);
  });

  function renderChart(data) {
    if (chart) chart.destroy();

    const testCaseNames = data[0]?.results?.map(r => r.name) ?? [];

    const colors = [
      "rgba(138, 196, 255, 0.8)",
      "rgba(138, 255, 196, 0.8)",
      "rgba(255, 196, 138, 0.8)",
      "rgba(196, 138, 255, 0.8)",
      "rgba(255, 138, 196, 0.8)",
      "rgba(196, 255, 138, 0.8)",
      "rgba(255, 255, 138, 0.8)",
      "rgba(138, 255, 255, 0.8)",
    ];

    const datasets = data.map((iteration, i) => ({
      label: `N=${iteration.iterationSize}`,
      data: iteration.results.map(r => r.opsPerSec),
      backgroundColor: colors[i % colors.length],
      borderColor: colors[i % colors.length].replace("0.8", "1"),
      borderWidth: 1,
    }));

    chart = new Chart(canvasEl, {
      type: "bar",
      data: {
        labels: testCaseNames,
        datasets,
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
            labels: { color: css("--color-text-secondary"), font: { size: 11 } },
          },
          tooltip: {
            callbacks: {
              label: ctx => {
                const val = ctx.parsed.y;
                return `${ctx.dataset.label}: ${formatOps(val)} ops/sec`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: css("--color-text-muted") },
            grid: { color: css("--color-surface") },
          },
          y: {
            ticks: {
              color: css("--color-text-muted"),
              callback: val => formatOps(val),
            },
            grid: { color: css("--color-surface") },
            title: {
              display: true,
              text: "ops/sec",
              color: css("--color-text-muted"),
            },
          },
        },
      },
    });
  }

  function formatOps(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return n.toFixed(0);
  }

  onDestroy(() => {
    chart?.destroy();
  });
</script>

<div class="chart-container">
  <canvas bind:this={canvasEl}></canvas>
</div>

<style>
  .chart-container {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    background: var(--color-surface);
  }
  h3 {
    margin: 0;
    font-size: var(--font-lg);
    font-weight: 600;
    color: var(--color-accent);
  }
</style>
