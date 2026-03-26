import { translations } from './translations.js';

let currentLocale = 'vi';

function translate(key, ...args) {
    const localeMap = translations[currentLocale] || translations.vi || {};
    const fallbackMap = translations.vi || {};
    const value = localeMap[key] ?? fallbackMap[key] ?? key;
    return typeof value === 'function' ? value(...args) : value;
}

function installTranslations() {
    window._t = translate;
    if (typeof Vue !== 'undefined' && Vue.prototype) {
        Vue.prototype.$t = translate;
    }
}

export function getCurrentLocale() {
    return currentLocale;
}

export async function initI18n() {
    installTranslations();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch('http://ip-api.com/json/?fields=status,message,countryCode', {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.countryCode !== 'VN') {
                currentLocale = 'en';
                installTranslations();
            }
        }
    } catch (error) {
    }

    return currentLocale;
}