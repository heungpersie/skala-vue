<!--   http://localhost:5173/skala-vue/-->

<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

function isGroupActive(group) {
  return group.links.some((link) => link.to === route.path)
}

const nav = [
  {
    category: '과제',
    groups: [
      {
        label: 'Weather',
        links: [
          { to: '/WeatherMockup', label: 'WeatherMockup' },
          { to: '/WeatherComposition', label: 'WeatherComposition' },
          { to: '/WeatherParent', label: 'WeatherParent' },
        ],
      },
    ],
  },
  {
    category: '실습',
    groups: [
      {
        label: 'Day 1',
        links: [
          { to: '/', label: 'Home' },
          { to: '/about', label: 'About' },
          { to: '/reactivity', label: 'Reactivity' },
          { to: '/interpolation', label: 'Interpolation' },
          { to: '/vfunction', label: 'V Function' },
          { to: '/Event', label: 'Event' },
          { to: '/Binding', label: 'Binding' },
          { to: '/Style', label: 'Style' },
        ],
      },
      {
        label: 'Day 2',
        links: [
          { to: '/Composition', label: 'Composition' },
          { to: '/Computed', label: 'Computed' },
          { to: '/ComponentParents', label: 'ComponentParents' },
          { to: '/PropsEmitsParent', label: 'PropsEmitsParent' },
          { to: '/SlotDefaultParent', label: 'SlotDefaultParent' },
          { to: '/SlotNamedParent', label: 'SlotNamedParent' },
          { to: '/SlotScopedParent', label: 'SlotScopedParent' },
        ],
      },
    ],
  },
]
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <RouterLink to="/" class="brand">
        <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="36" height="36" />
        <span>Skala Vue</span>
      </RouterLink>

      <nav class="nav">
        <section v-for="section in nav" :key="section.category" class="category">
          <h2 class="category-title">{{ section.category }}</h2>

          <div
            v-for="group in section.groups"
            :key="group.label"
            class="group"
            :class="{ 'group-active': isGroupActive(group) }"
            tabindex="0"
          >
            <div class="group-title">
              <span>{{ group.label }}</span>
              <span class="caret">›</span>
            </div>
            <ul class="links flyout">
              <li v-for="link in group.links" :key="link.to">
                <RouterLink :to="link.to" class="link">{{ link.label }}</RouterLink>
              </li>
            </ul>
          </div>
        </section>
      </nav>
    </aside>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  align-items: stretch;
}

.sidebar {
  width: 200px;
  flex-shrink: 0;
  padding: 1.5rem 1.25rem;
  border-right: 1px solid var(--color-border);
  background: var(--color-background-soft);
  overflow: visible;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: var(--color-heading);
  font-weight: 700;
  font-size: 1.15rem;
  margin-bottom: 1.75rem;
}

.logo {
  display: block;
}

.category + .category {
  margin-top: 1.75rem;
}

.category-title {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: hsla(160, 100%, 37%, 1);
  margin-bottom: 0.75rem;
}

.group {
  position: relative;
}

.group + .group {
  margin-top: 0.25rem;
}

.group:focus-visible {
  outline: none;
}

.group-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
  opacity: 0.75;
  cursor: default;
  transition: background-color 0.2s, opacity 0.2s;
}

.caret {
  opacity: 0.5;
  transition: transform 0.2s;
}

.group:hover .group-title,
.group:focus-within .group-title,
.group-active .group-title {
  opacity: 1;
  background-color: hsla(160, 100%, 37%, 0.12);
}

.group-active .group-title {
  color: hsla(160, 100%, 37%, 1);
}

.group:hover .caret,
.group:focus-within .caret {
  transform: translateX(2px);
}

.links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.flyout {
  position: absolute;
  top: 0;
  left: 100%;
  z-index: 20;
  min-width: 200px;
  padding: 0.5rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
  visibility: hidden;
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.15s, transform 0.15s, visibility 0.15s;
}

.group:hover .flyout,
.group:focus-within .flyout {
  visibility: visible;
  opacity: 1;
  transform: translateX(0);
}

.link {
  display: block;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  font-size: 0.9rem;
  color: var(--color-text);
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 0.2s, color 0.2s;
}

.link:hover {
  background-color: hsla(160, 100%, 37%, 0.12);
}

.link.router-link-exact-active {
  background-color: hsla(160, 100%, 37%, 1);
  color: #fff;
  font-weight: 600;
}

.content {
  flex: 1;
  padding: 2.5rem 3rem;
  min-width: 0;
}

@media (max-width: 720px) {
  .layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }

  .content {
    padding: 1.5rem;
  }
}
</style>
