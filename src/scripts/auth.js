(function () {
    'use strict';

    function decodeJwtPayload(token) {
        try {
            const base64Url = token.split('.')[1];
            if (!base64Url) return null;
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }

    function isTokenExpired(payload) {
        if (!payload || !payload.exp) return true;
        return payload.exp * 1000 < Date.now();
    }

    window.checkAuth = function () {
        const token = localStorage.getItem('token');

        if (!token) {
            redirectToLogin();
            return false;
        }

        const payload = decodeJwtPayload(token);

        if (!payload || isTokenExpired(payload)) {
            clearSession();
            redirectToLogin();
            return false;
        }

        return true;
    };
    window.getUser = function () {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const payload = decodeJwtPayload(token);
        if (!payload || isTokenExpired(payload)) return null;
        return { id: payload.id, name: payload.name };
    };

    window.logout = function () {
        clearSession();
        window.location.href = '../../index.html';
    };

    function clearSession() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    function redirectToLogin() {
        if (!window.location.pathname.endsWith('login.html')) {
            window.location.href = 'login.html';
        }
    }

})();