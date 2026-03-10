import { API_CONFIG } from '../config.js';

export class ApiService {
  static getAuthHeaders() {
    const token = localStorage.getItem('jwt_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  static async handleResponse(response) {
    if (response.status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_email');
      window.location.href = 'login.html';
      throw new Error('Unauthorized');
    }
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  }

  // Enhanced error handling for optimistic updates
  static async safeApiCall(apiCall, errorContext = '') {
    try {
      return await apiCall();
    } catch (error) {
      console.error(`${errorContext} failed:`, error);
      throw {
        ...error,
        message: error.message,
        isNetworkError: error.name === 'TypeError' || (error.message && error.message.includes('fetch')),
        isServerError: error.message && error.message.includes('Internal Server Error'),
        shouldRetry: error.name === 'TypeError' || error.status >= 500
      };
    }
  }

  static async getTasks() {
    return this.safeApiCall(async () => {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      return this.handleResponse(response);
    }, 'Get tasks');
  }

  static async createTask(title) {
    return this.safeApiCall(async () => {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ title })
      });
      return this.handleResponse(response);
    }, 'Create task');
  }

  static async updateTask(taskId, title) {
    return this.safeApiCall(async () => {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/${taskId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ title })
      });
      return this.handleResponse(response);
    }, 'Update task');
  }

  static async finishTask(taskId, finished = true) {
    return this.safeApiCall(async () => {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/${taskId}/finish`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ finished })
      });
      return this.handleResponse(response);
    }, 'Finish task');
  }

  static async moveTask(taskId, targetSlot) {
    return this.safeApiCall(async () => {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/${taskId}/move`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ target_slot: targetSlot })
      });
      return this.handleResponse(response);
    }, 'Move task');
  }

  static async deleteTask(taskId) {
    return this.safeApiCall(async () => {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/${taskId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      return this.handleResponse(response);
    }, 'Delete task');
  }

  static async createLongTask(title) {
    return this.safeApiCall(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200000); // 1200 second timeout

      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LONG_TASKS}`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ title }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        return this.handleResponse(response);
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw { ...error, message: 'Long task processing timed out', isTimeout: true };
        }
        throw error;
      }
    }, 'Create long task');
  }

  // Admin endpoints
  static async checkAdminStatus() {
    return this.safeApiCall(async () => {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/check-status`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      return this.handleResponse(response);
    }, 'Check admin status');
  }

  static async getUserTasks(email) {
    return this.safeApiCall(async () => {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/tasks/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      return this.handleResponse(response);
    }, 'Get user tasks');
  }

  static async createTaskForUser(email, title) {
    return this.safeApiCall(async () => {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/tasks/${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ title })
      });
      return this.handleResponse(response);
    }, 'Create task for user');
  }
}
