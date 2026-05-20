import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, _from, savedPosition) {
    if (to.hash) {
      return new Promise(resolve => {
        setTimeout(() => resolve({ el: to.hash, behavior: 'smooth' }), 100)
      })
    }
    return savedPosition || { top: 0 }
  },
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
      path: '/products',
      name: 'products',
      component: () => import('../views/ProductCatalog.vue'),
    },
    {
      path: '/products/create',
      name: 'product-create',
      component: () => import('../views/CreateProduct.vue'),
    },
    {
      path: '/products/edit/:id',
      name: 'product-edit',
      component: () => import('../views/EditProduct.vue'),
    },
  ],
})

export default router
