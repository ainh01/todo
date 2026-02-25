import TodoApp from './components/TodoApp.js';
import { authGuard } from './modules/authGuard.js';

authGuard();

const app = new Vue({
    el: '#todo-app',
    render: h => h(TodoApp)
});

window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', event.reason);
    alert('An unexpected error occurred. Please try again.');
});
