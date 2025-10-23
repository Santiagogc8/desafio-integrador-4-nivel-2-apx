import {Router} from '@vaadin/router'; // Usamos vaadin router para evitar crear el router desde 0

const router = new Router(document.getElementById('root'));
router.setRoutes([
    {path: '/', component: 'x-home-view'},
    {path: '/users', component: 'x-user-list'}
]);