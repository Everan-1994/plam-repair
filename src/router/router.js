import Main from '@/views/Main.vue';

// 不作为Main组件的子页面展示的页面单独写，如下
export const loginRouter = {
    path: '/login',
    name: 'login',
    meta: {
        title: 'Login - 登录'
    },
    component: () => import('@/views/login.vue')
};

export const page404 = {
    path: '/*',
    name: 'error-404',
    meta: {
        title: '404-页面不存在'
    },
    component: () => import('@/views/error-page/404.vue')
};

export const page403 = {
    path: '/403',
    meta: {
        title: '403-权限不足'
    },
    name: 'error-403',
    component: () => import('@//views/error-page/403.vue')
};

export const page500 = {
    path: '/500',
    meta: {
        title: '500-服务端错误'
    },
    name: 'error-500',
    component: () => import('@/views/error-page/500.vue')
};

export const preview = {
    path: '/preview',
    name: 'preview',
    component: () => import('@/views/form/article-publish/preview.vue')
};

export const locking = {
    path: '/locking',
    name: 'locking',
    component: () => import('@/views/main-components/lockscreen/components/locking-page.vue')
};

// 作为Main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
export const otherRouter = {
    path: '/',
    name: 'otherRouter',
    redirect: '/home',
    component: Main,
    children: [
        { path: 'home', title: {i18n: 'home'}, name: 'home_index', component: () => import('@/views/home/home.vue') },
        { path: 'ownspace', title: '个人中心', name: 'ownspace_index', component: () => import('@/views/own-space/own-space.vue') },
        {path: 'message', title: '消息中心', name: 'message_index', component: () => import('@/views/message/message.vue') }
    ]
};

// 作为Main组件的子页面展示并且在左侧菜单显示的路由写在appRouter里
export const appRouter = [
    {
        path: '/school',
        icon: 'ios-home',
        name: 'school',
        title: '学校管理',
        access: [1],
        component: Main,
        children: [
            { path: 'school', title: '学校管理', name: 'school_index', access: 1, component: () => import('@/views/school/schools.vue') }
        ]
    },
    {
        path: '/users',
        icon: 'android-person',
        title: '用户管理',
        name: 'users',
        access: [1, 2],
        component: Main,
        children: [
            { path: 'customers', title: '客户管理', name: 'customers', access: 1, component: () => import('@/views/users/customers.vue') },
            { path: 'admins', title: '管理员', name: 'admins', access: [1, 2], component: () => import('@/views/users/admins.vue') },
            { path: 'repairmans', title: '维修员', name: 'repairmans', access: 2, component: () => import('@/views/users/repairmans.vue') },
            { path: 'members', title: '用户管理', name: 'members', access: 2, component: () => import('@/views/users/members.vue') }
        ]
    },
    {
        path: '/orders',
        icon: 'ios-paper-outline',
        title: '工单管理',
        name: 'orders',
        access: [2],
        component: Main,
        children: [
            { path: 'orders', title: '工单管理', name: 'orders_index', access: 2, component: () => import('@/views/orders/orders.vue') }
        ]
    },
    {
        path: '/systems',
        icon: 'ios-speedometer-outline',
        title: '系统管理',
        name: 'systems',
        access: [2],
        component: Main,
        children: [
            { path: 'areas', title: '区域管理', name: 'areas_index', access: 2, component: () => import('@/views/systems/areas.vue') },
            { path: 'base', title: '基本设置', name: 'base_index', access: 2, component: () => import('@/views/systems/base.vue') },
        ]
    }

];

// 所有上面定义的路由都要写在下面的routers里
export const routers = [
    loginRouter,
    otherRouter,
    preview,
    locking,
    ...appRouter,
    page500,
    page403,
    page404
];
