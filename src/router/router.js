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
        { path: 'order/:order_id', title: '订单详情', name: 'order-info', component: () => import('@/views/advanced-router/component/order-info.vue') }, // 用于展示动态路由
        { path: 'shopping', title: '购物详情', name: 'shopping', component: () => import('@/views/advanced-router/component/shopping-info.vue') }, // 用于展示带参路由
        { path: 'message', title: '消息中心', name: 'message_index', component: () => import('@/views/message/message.vue') }
    ]
};

// 作为Main组件的子页面展示并且在左侧菜单显示的路由写在appRouter里
export const appRouter = [
    {
        path: '/users',
        icon: 'lock-combination',
        title: '用户管理',
        name: 'users',
        access: 0,
        component: Main,
        children: [
            { path: 'customers', title: '客户管理', name: 'customers_index', access: 0, component: () => import('@/views/users/customers.vue') },
            { path: 'admins', title: '管理员', name: 'admins_index', access: 0, component: () => import('@/views/users/admins.vue') },
            { path: 'repairmans', title: '维修员', name: 'repairmans_index', access: 0, component: () => import('@/views/users/repairmans.vue') },
            { path: 'members', title: '用户管理', name: 'members_index', access: 0, component: () => import('@/views/users/members.vue') }
        ]
    },
    {
        path: '/orders',
        icon: 'android-sad',
        title: '工单管理',
        name: 'orders',
        component: Main,
        children: [
            { path: 'to-be-repaired', title: '待维修', name: 'to-be-repaired_index', component: () => import('@/views/orders/to-be-repaired.vue') },
            { path: 'repairing', title: '维修中', name: 'repairing_index', component: () => import('@/views/orders/repairing.vue') },
            { path: 'repaired', title: '已维修', name: 'repaired_index', component: () => import('@/views/orders/repaired.vue') },
            { path: 'dismissed', title: '已驳回', name: 'dismissed_index', component: () => import('@/views/orders/dismissed.vue') },
            { path: 'appealing', title: '申述管理', name: 'appealing_index', component: () => import('@/views/orders/appealing.vue') },
        ]
    },
    {
        path: '/error-page',
        icon: 'android-sad',
        title: '错误页面',
        name: 'errorpage',
        component: Main,
        children: [
            { path: 'index', title: '错误页面', name: 'errorpage_index', component: () => import('@/views/error-page/error-page.vue') }
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
