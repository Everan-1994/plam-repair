import Vue from 'vue';
import iView from 'iview';
import {router} from './router/index';
import {appRouter} from './router/router';
import store from './store';
import App from './app.vue';
import '@/locale';
import 'iview/dist/styles/iview.css';
import VueI18n from 'vue-i18n';
import axios from 'axios';
import JWT from './helpers/jwt';
// import util from './libs/util';

Vue.use(VueI18n);
Vue.use(iView);

new Vue({
    el: '#app',
    router: router,
    store: store,
    render: h => h(App),
    data: {
        currentPageName: ''
    },
    mounted () {
        this.currentPageName = this.$route.name;
        // 显示打开的页面的列表
        this.$store.commit('setOpenedList');
        this.$store.commit('initCachepage');
        // 权限菜单过滤相关
        this.$store.commit('updateMenulist');
        // iview-admin检查更新
        // util.checkUpdate(this);
    },
    created () {
        let tagsList = [];
        appRouter.map((item) => {
            if (item.children.length <= 1) {
                tagsList.push(item.children[0]);
            } else {
                tagsList.push(...item.children);
            }
        });
        this.$store.commit('setTagsList', tagsList);

        // 请求拦截器
        axios.interceptors.request.use(function (config) {
            // 头部携带 token
            config.headers['Authorization'] = JWT.getToken() || 'Bearer token is null';
            return config;
        }, function (error) {
            return Promise.reject(error);
        });

        // 自定义的 axios 响应拦截器
        axios.interceptors.response.use((response) => {
            // 判断一下响应中是否有 token，如果有就直接使用此 token 替换掉本地的 token。你可以根据你的业务需求自己编写更新 token 的逻辑
            let token = response.headers.authorization;
            if (token) {
                // 如果 header 中存在 token，那么触发 refreshToken 方法，替换本地的 token
                // this.$store.dispatch('refreshToken', token);
                JWT.setToken(token);
            }
            return response;
        }, (error) => {
            switch (error.response.status) {
                // 如果响应中的 http code 为 401，那么则此用户可能 token 失效了之类的，我会触发 logout 方法，清除本地的数据并将用户重定向至登录页面
                case 401:
                    JWT.removeToken();
                    store.commit('logout', this);
                    store.commit('clearOpenedSubmenu');
                    iView.Message.warning({
                        content: '身份信息已过期，请重新登陆。',
                        duration: 2,
                        onClose: () => {
                            router.push({name: 'login'});
                        }
                    });
                    return false;
                    break;
                // 如果响应中的 http code 为 400，那么就弹出一条错误提示给用户
                case 400:
                    this.$Message.error(error.response.data.error);
                    break;
                case 403:
                    this.$Message.warning('Sorry，没有权限！');
                    break;
            }
            return Promise.reject(error);
        })
    }
});
