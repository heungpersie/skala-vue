import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

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
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/reactivity',
      name: 'reactivity',
      component: () => import('../views/ReactivityView.vue'),
    },
    {
      path: '/interpolation',
      name: 'interpolation',
      component: () => import('../views/InterpolationView.vue'),
    },
    {
      path: '/vfunction',
      name: 'vfunction',
      component: () => import('../views/VfunctionView.vue'),
    },
    {
      path: '/Event',
      name: 'Event',
      component: () => import('../views/EventView.vue'),
    },
    {
      path: '/Binding',
      name: 'Binding',
      component: () => import('../views/BindingView.vue'),
    },
    {
      path: '/Style',
      name: 'Style',
      component: () => import('../views/StyleView.vue'),
    },
    {
      path: '/Mockup',
      name: 'Mockup',
      component: () => import('../views/MockupView.vue'),
    }

  ],
})

export default router
