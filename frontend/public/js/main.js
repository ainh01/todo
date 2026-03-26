import TodoApp from './components/TodoApp.js';
import { authGuard } from './modules/authGuard.js';
import { initI18n } from './i18n/i18n.js';

authGuard();

await initI18n();

const app = new Vue({
    el: '#todo-app',
    render: h => h(TodoApp)
});

window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
  window._t
    ? alert(window._t('defaultAlertTitle'))
    : alert('An unexpected error occurred. Please try again.');
});
