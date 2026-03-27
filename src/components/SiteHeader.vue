<template>
  <header class="site-header">
    <div class="header-inner">
      <div class="logo" @click="$emit('go-home')">
        <span class="logo-icon">S</span>
        <span class="logo-text">Scrabble</span>
      </div>
      <nav class="header-nav">
        <span class="lang-badge" title="English">
          <img src="../assets/flags/gb.png" alt="English" class="nav-flag" />
          EN
        </span>
        <span class="lang-badge" title="Dutch">
          <img src="../assets/flags/nl.png" alt="Dutch" class="nav-flag" />
          NL
        </span>
        <span class="lang-badge" title="Hungarian">
          <img src="../assets/flags/hu.png" alt="Hungarian" class="nav-flag" />
          HU
        </span>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  name: "SiteHeader",
};
</script>

<style scoped>
.site-header {
  width: 100%;
  padding: 0 24px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 50;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.logo-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: #fff;
  font-weight: 800;
  font-size: 18px;
  border-radius: 8px;
  font-family: "Inter", sans-serif;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.35);
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.02em;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lang-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.1);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.nav-flag {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

@media (max-width: 632px) {
  .site-header {
    padding: 0 16px;
  }

  .header-inner {
    height: 52px;
  }

  .logo-text {
    font-size: 17px;
  }

  .lang-badge {
    padding: 4px 7px;
    font-size: 10px;
  }

  .nav-flag {
    width: 14px;
    height: 14px;
  }
}
</style>
