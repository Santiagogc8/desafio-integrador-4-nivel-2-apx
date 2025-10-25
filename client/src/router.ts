import {Router} from '@vaadin/router'; // Usamos vaadin router para evitar crear el router desde 0

const router = new Router(document.getElementById('root'));
router.setRoutes([
    {path: '/', component: 'home-page'},
    {path: '/login', component: 'auth-page'},
    {path: '/register', component: 'auth-page'},
    {path: '/game', component: 'new-game'},
    {path: '/room/:roomId', component: 'game-room'},
]);