import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '@auth0/auth0-vue'
import { adminGuard, userOnlyGuard } from './guards.js'
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
      path: '/callback',
      name: 'callback',
      component: () => import('../views/CallbackView.vue'),
    },
    {
      path: '/impressum',
      name: 'impressum',
      component: () => import('../views/ImpressumView.vue'),
    },
    {
      path: '/datenschutz',
      name: 'datenschutz',
      component: () => import('../views/DatenschutzView.vue'),
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
      beforeEnter: authGuard,
    },
    {
      path: '/products/edit/:id',
      name: 'product-edit',
      component: () => import('../views/EditProduct.vue'),
      beforeEnter: authGuard,
    },
    {
      path: '/products/:id',
      name: 'product-detail',
      component: () => import('../views/ProductDetail.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      beforeEnter: authGuard,
    },

    // ── Admin area ──────────────────────────────────────────────
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      beforeEnter: adminGuard,
      meta: { hideGlobalNav: true },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('../views/AdminUsersView.vue'),
      beforeEnter: adminGuard,
      meta: { hideGlobalNav: true },
    },
    {
      path: '/admin/categories',
      name: 'admin-categories',
      component: () => import('../views/AdminCategoriesView.vue'),
      beforeEnter: adminGuard,
      meta: { hideGlobalNav: true },
    },
    {
      path: '/admin/events',
      name: 'admin-events',
      component: () => import('../views/AdminEventsView.vue'),
      beforeEnter: adminGuard,
      meta: { hideGlobalNav: true },
    },
    {
      path: '/admin/fahrzeugverwaltung',
      name: 'admin-fahrzeugverwaltung',
      component: () => import('../views/AdminVehicleManagementView.vue'),
      beforeEnter: adminGuard,
      meta: { hideGlobalNav: true },
    },
    {
      path: '/admin/vehicles',
      redirect: '/admin/fahrzeugverwaltung',
    },
    {
      path: '/admin/reviews',
      redirect: '/admin/fahrzeugverwaltung',
    },
    {
      path: '/admin/transactions',
      name: 'admin-transactions',
      component: () => import('../views/AdminTransactionsView.vue'),
      beforeEnter: adminGuard,
      meta: { hideGlobalNav: true },
    },

    // ── User area ────────────────────────────────────────────────
    {
      path: '/user',
      redirect: '/user/events',
    },
    {
      path: '/user/events',
      name: 'user-events',
      component: () => import('../views/UserEventsView.vue'),
      beforeEnter: userOnlyGuard,
      meta: { hideGlobalNav: true },
    },
    {
      path: '/user/vehicles',
      name: 'user-vehicles',
      component: () => import('../views/UserVehiclesView.vue'),
      beforeEnter: userOnlyGuard,
      meta: { hideGlobalNav: true },
    },
    {
      path: '/user/profile',
      name: 'user-profile',
      component: () => import('../views/ProfileView.vue'),
      beforeEnter: authGuard,
      meta: { hideGlobalNav: true },
    },
    {
      path: '/user/become-event-manager',
      name: 'become-event-manager',
      component: () => import('../views/BecomeEventManagerView.vue'),
      beforeEnter: userOnlyGuard,
      meta: { hideGlobalNav: true },
    },
  ],
})

export default router
