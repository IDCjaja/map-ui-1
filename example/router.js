import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      redirect: '/map-point',
    },
    { path: '/map-point', component: () => import('./components/map_point') },
    { path: '/regions', component: () => import('./components/regions') },
    { path: '/label-marker', component: () => import('./components/label_marker') },
  ],
});

export default router;
