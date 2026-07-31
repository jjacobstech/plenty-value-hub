import limiter from '@adonisjs/limiter/services/main';
export const authThrottle = limiter.define('auth', () => {
    return limiter.allowRequests(10).every('15 mins').blockFor('10 mins');
});
export const signupThrottle = limiter.define('signup', () => {
    return limiter.allowRequests(5).every('1 hour');
});
export const adminThrottle = limiter.define('admin', () => {
    return limiter.allowRequests(100).every('1 min');
});
//# sourceMappingURL=limiter.js.map