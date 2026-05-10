<script>
  let { title } = $props();
</script>

<h3 class="section-title">
  <span class="text">{title}</span>
  <span class="line"></span>
</h3>

<style>
  .section-title {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-5);
    padding-bottom: var(--space-1);
    font-size: var(--font-lg);
    font-weight: 600;
    color: var(--color-accent);
  }
  .line {
    flex: 1;
    height: 1px;
    background: rgba(51, 51, 51, 0.452);
  }
</style>
