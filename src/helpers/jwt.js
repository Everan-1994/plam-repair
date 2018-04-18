export default {
    setToken(token) {
        window.localStorage.setItem('jwt_token', token);
    },
    getToken() {
        return window.localStorage.getItem('jwt_token');
    },
    removeToken() {
        window.localStorage.removeItem('jwt_token');
    },
    setMenus(menus) {
        window.localStorage.setItem('menus', menus);
    },
    getMenus() {
        return window.localStorage.getItem('menus');
    },
    removeMenus() {
        window.localStorage.removeItem('menus');
    }
}
