const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_data';

export const authService = {
    setToken(token) {
        localStorage.setItem(TOKEN_KEY, token);
    },

    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    },

    removeToken() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    setUser(user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    getUser() {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated() {
        return !!this.getToken();
    },

    hasRole(role) {
        const user = this.getUser();
        return user && user.roles && user.roles.includes(role);
    },

    hasAnyRole(roles) {
        const user = this.getUser();
        if (!user || !user.roles) return false;
        return roles.some(role => user.roles.includes(role));
    },

    logout() {
        this.removeToken();
        window.location.href = '/';
    }
};