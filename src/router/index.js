import Vue from 'vue';
import VueRouter from 'vue-router';
import Homepage from '../views/Homepage.vue';
import Login from '../views/Login.vue';
import store from '../store/index';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Домашнаяя страница',
    component: Homepage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/login',
    name: 'Авторизация',
    component: Login,
  },
  {
    path: '/projects',
    name: 'Проекты',
    component: () => import('../views/projects/ProjectList.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/templates',
    name: 'Шаблоны спецификаций',
    component: () => import('../views/specifications/SpecificationTemplates.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/templates/create',
    name: 'Создание шаблона спецификации',
    component: () => import('../views/specifications/SpecificationTemplate.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/projects/:projId/requirements',
    name: 'Требования',
    component: () => import('../views/requirements/Requirements.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/projects/:projId/requirements/:reqID',
    name: 'Требование',
    component: () => import('../views/requirements/Requirement.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/projects/:projId/specifications',
    name: 'Спецификации',
    component: () => import('../views/specifications/SpecificationList.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/projects/:projId/specifications/create',
    name: 'Создание спецификации',
    component: () => import('../views/specifications/SpecificationCreatePage.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/projects/:projId/specifications/:specId',
    name: 'Спецификация',
    component: () => import('../views/specifications/Specification.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/page-not-found',
    alias: '*',
    name: 'NotFound',
    component: { render: h => h('div', ['404! Page Not Found!']) },
  },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});
router.beforeEach((to, from, next) => {
  document.title = to.name;
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (store.getters.isLoggedIn) {
      next();
      return;
    }
    next('/login');
  } else {
    next();
  }
  next();
});

export default router;
