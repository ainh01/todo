export function authGuard() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

export function logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_email');
    window.location.href = 'login.html';
}
