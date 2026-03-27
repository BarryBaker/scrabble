<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <span class="footer-logo">S</span>
        <span class="footer-name">Scrabble</span>
      </div>
      <div class="footer-links">
        <span class="footer-link">English</span>
        <span class="footer-sep">&middot;</span>
        <span class="footer-link">Dutch</span>
        <span class="footer-sep">&middot;</span>
        <span class="footer-link">Hungarian</span>
      </div>
      <div class="footer-copy">
        &copy; {{ year }} Scrabble &mdash; Play the classic word game online
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "SiteFooter",
  computed: {
    year() {
      return new Date().getFullYear();
    },
  },
};
</script>

<style scoped>
.site-footer {
  width: 100%;
  padding: 32px 24px;
  border-top: 1px solid rgba(148, 163, 184, 0.08);
  background: rgba(15, 23, 42, 0.6);
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-logo {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: #fff;
  font-weight: 800;
  font-size: 14px;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
}

.footer-name {
  font-size: 16px;
  font-weight: 700;
  color: #cbd5e1;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-link {
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
}

.footer-sep {
  color: #334155;
  font-size: 13px;
}

.footer-copy {
  color: #475569;
  font-size: 12px;
  text-align: center;
}

@media (max-width: 632px) {
  .site-footer {
    padding: 24px 16px;
  }
}
</style>
