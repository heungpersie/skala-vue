<!--   http://localhost:5173/skala-vue/-->

<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

function isGroupActive(group) {
  return group.links.some((link) => link.to === route.path)
}

const nav = [
  {
    category: '계정',
    groups: [
      {
        label: 'login',
        links: [{ to: '/login', label: 'Login' }],
      },

    ],
  },
  {
    category: '과제',
    groups: [
      {
        label: 'Weather',
        links: [
          { to: '/WeatherMockup', label: 'WeatherMockup' },
          { to: '/WeatherComposition', label: 'WeatherComposition' },
          { to: '/WeatherParent', label: 'WeatherParent' },
          { to: '/weather-router', label: 'WeatherRouter' },
          { to: '/weather-store', label: 'WeatherStore' },
        ],
      },
      {
        label: 'Heungbu and Magpie',
        links: [{ to: '/MagpieHeung', label: 'MagpieHeung' }],
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
      {
        label: 'Day 3',
        links: [
          { to: '/UseRouter', label: 'UseRouter' },
          { to: '/OpenWeatherTest', label: 'OpenWeatherTest' },
          { to: '/TeleportParent', label: 'TeleportParent' },
          { to: '/TransitionParent', label: 'TransitionParent' },
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
        <svg class="logo" viewBox="0 0 64 64" width="36" height="36" aria-hidden="true">
          <defs>
            <linearGradient id="magpieTail" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="var(--magpie-teal)" />
              <stop offset="55%" stop-color="var(--magpie-blue)" />
              <stop offset="100%" stop-color="var(--magpie-violet)" />
            </linearGradient>
          </defs>
          <path d="M40 32 L61 47 L52 50 L58 58 L47 54 L44 44 Z" fill="url(#magpieTail)" />
          <ellipse
            cx="32"
            cy="35"
            rx="16"
            ry="13"
            fill="#2c313a"
            stroke="rgba(255,255,255,0.5)"
            stroke-width="1"
          />
          <ellipse cx="28" cy="40" rx="8" ry="6.5" fill="var(--magpie-white)" />
          <circle
            cx="17"
            cy="24"
            r="9"
            fill="#2c313a"
            stroke="rgba(255,255,255,0.5)"
            stroke-width="1"
          />
          <polygon
            points="8,24 2,22 8,20"
            fill="#2c313a"
            stroke="rgba(255,255,255,0.5)"
            stroke-width="1"
            stroke-linejoin="round"
          />
          <circle cx="15" cy="22" r="1.6" fill="var(--magpie-white)" />
          <line
            x1="24"
            y1="46"
            x2="22"
            y2="54"
            stroke="#2c313a"
            stroke-width="2"
            stroke-linecap="round"
          />
          <line
            x1="32"
            y1="47"
            x2="31"
            y2="55"
            stroke="#2c313a"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
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
  position: sticky;
  top: 0;
  z-index: 30;
  height: 100vh;
  width: 200px;
  flex-shrink: 0;
  padding: 1.5rem 1.25rem;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--magpie-black);
  overflow: visible;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--magpie-gradient);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: var(--magpie-white);
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
  background: var(--magpie-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
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
  color: rgba(250, 250, 250, 0.75);
  opacity: 0.75;
  cursor: default;
  transition:
    background-color 0.2s,
    opacity 0.2s;
}

.caret {
  opacity: 0.5;
  transition: transform 0.2s;
}

.group:hover .group-title,
.group:focus-within .group-title,
.group-active .group-title {
  opacity: 1;
  background-color: var(--magpie-accent-soft);
}

.group-active .group-title {
  color: var(--magpie-accent);
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
  background: var(--magpie-black);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
  visibility: hidden;
  opacity: 0;
  transform: translateX(-4px);
  transition:
    opacity 0.15s,
    transform 0.15s,
    visibility 0.15s;
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
  color: rgba(250, 250, 250, 0.85);
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.link:hover {
  background-color: var(--magpie-accent-soft);
}

.link.router-link-exact-active {
  background: var(--magpie-gradient);
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
    position: static;
    height: auto;
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .content {
    padding: 1.5rem;
  }
}
</style>
