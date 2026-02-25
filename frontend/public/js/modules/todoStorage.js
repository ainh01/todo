import { ApiService } from './apiService.js';

export class TodoStorage {
    static async fetch() {
        try {
            const response = await ApiService.getTasks();
            const todos = response.data || response;

            const normalizedTodos = (Array.isArray(todos) ? todos : []).map(todo => ({
                id: todo.task_id,
                title: todo.title || '',
                slot: todo.slot || 0,
                completed: todo.finished || false,
                removed: false,
                created_at: todo.created_at,
                updated_at: todo.updated_at,
            }));

            return normalizedTodos.sort((a, b) => a.slot - b.slot);
        } catch (error) {
            console.error('Failed to fetch todos:', error);
            throw error;
        }
    }
    static getSlogan() {
        return localStorage.getItem('uiineed-slogan') || 'Act Now, Simplify Life.☕';
    }
    static saveSlogan(slogan) {
        localStorage.setItem('uiineed-slogan', slogan);
    }
}
