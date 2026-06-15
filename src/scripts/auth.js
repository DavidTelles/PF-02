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

    /**
     * Verifica se o token está expirado comparando `exp` com o horário atual.
     */
    function isTokenExpired(payload) {
        if (!payload || !payload.exp) return true;
        // exp está em segundos, Date.now() em milissegundos
        return payload.exp * 1000 < Date.now();
    }

    // ---------- API pública ----------

    /**
     * Verifica autenticação. Chame no topo de cada página protegida.
     * Redireciona para login.html se token ausente ou expirado.
     */
    window.checkAuth = function () {
        const token = localStorage.getItem('token');

        if (!token) {
            redirectToLogin();
            return false;
        }

        const payload = decodeJwtPayload(token);

        if (!payload || isTokenExpired(payload)) {
            // Token expirado ou malformado: limpa e redireciona
            clearSession();
            redirectToLogin();
            return false;
        }

        return true;
    };

    /**
     * Retorna os dados do usuário logado ou null.
     */
    window.getUser = function () {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const payload = decodeJwtPayload(token);
        if (!payload || isTokenExpired(payload)) return null;
        return { id: payload.id, name: payload.name };
    };

    /**
     * Realiza logout: limpa storage e redireciona para index.html
     */
    window.logout = function () {
        clearSession();
        // Calcula o caminho relativo para index.html
        // As páginas protegidas ficam em src/pages/, então sobem 2 níveis
        window.location.href = '../../index.html';
    };

    // ---------- Funções internas ----------

    function clearSession() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    function redirectToLogin() {
        // Redireciona sem criar loop: verifica se já está em login.html
        if (!window.location.pathname.endsWith('login.html')) {
            window.location.href = 'login.html';
        }
    }

})();