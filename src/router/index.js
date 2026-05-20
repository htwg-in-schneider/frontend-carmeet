import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/event/:id',
      name: 'event-detail',
      component: () => import('../views/EventDetailView.vue'),
    },
    {
      path: '/step/:id',
      name: 'step-detail',
      component: () => import('../views/StepDetailView.vue'),
    },
    {
      path: '/dummy-products/:id',
      name: 'dummy-product-detail',
      component: () => import('../views/ProductDetail.vue'),
    },
  ],
})

export default router
