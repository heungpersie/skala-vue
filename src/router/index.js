import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/Day1/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Day1/AboutView.vue'),
    },
    {
      path: '/reactivity',
      name: 'reactivity',
      component: () => import('../views/Day1/ReactivityView.vue'),
    },
    {
      path: '/interpolation',
      name: 'interpolation',
      component: () => import('../views/Day1/InterpolationView.vue'),
    },
    {
      path: '/vfunction',
      name: 'vfunction',
      component: () => import('../views/Day1/VfunctionView.vue'),
    },
    {
      path: '/Event',
      name: 'Event',
      component: () => import('../views/Day1/EventView.vue'),
    },
    {
      path: '/Binding',
      name: 'Binding',
      component: () => import('../views/Day1/BindingView.vue'),
    },
    {
      path: '/Style',
      name: 'Style',
      component: () => import('../views/Day1/StyleView.vue'),
    },
    {
      path: '/WeatherMockup',
      name: 'WeatherMockup',
      component: () => import('../views/work/WeatherMockup.vue'),
    },
    {
      path: '/Composition',
      name: 'Composition',
      component: () => import('../views/Day2/CompositionView.vue'),
    },
    {
      path: '/Computed',
      name: 'Computed',
      component: () => import('../views/Day2/ComputedView.vue'),
    },
    {
      path: '/WeatherComposition',
      name: 'WeatherComposition',
      component: () => import('../views/work/WeatherComposition.vue'),
    },
    {
      path: '/ComponentParents',
      name: 'ComponentParents',
      component: () => import('../views/Day2/ComponentParents.vue'),
    },
    {
      path: '/PropsEmitsParent',
      name: 'PropsEmitsParent',
      component: () => import('../views/Day2/PropsEmitsParent.vue'),
    },
    {
      path: '/SlotDefaultParent',
      name: 'SlotDefaultParent',
      component: () => import('../views/Day2/SlotDefaultParent.vue'),
    },
    {
      path: '/SlotNamedParent',
      name: 'SlotNamedParent',
      component: () => import('../views/Day2/SlotNamedParent.vue'),
    },
    {
      path: '/SlotScopedParent',
      name: 'SlotScopedParent',
      component: () => import('../views/Day2/SlotScopedParent.vue'),
    },
    {
      path: '/WeatherParent',
      name: 'WeatherParent',
      component: () => import('../views/work/WeatherParent.vue'),
    },
  ],
})

export default router
