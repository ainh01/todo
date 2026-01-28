const ApiService = {  
    getAuthHeaders() {  
        const token = localStorage.getItem('jwt_token');  
        return {  
            'Content-Type': 'application/json',  
            'Authorization': token ? `Bearer ${token}` : ''  
        };  
    },  

    async handleResponse(response) {  
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
    },  

    // Fetch all tasks (sorted by slot)
    async getTasks() {  
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}`, {  
            method: 'GET',  
            headers: this.getAuthHeaders()  
        });  
        return this.handleResponse(response);  
    },  

    // Get single task
    async getTask(taskId) {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/${taskId}`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    },

    // Create new task (only title required)
    async createTask(title) {  
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}`, {  
            method: 'POST',  
            headers: this.getAuthHeaders(),  
            body: JSON.stringify({ title })  
        });  
        return this.handleResponse(response);  
    },  

    // Update task title only
    async updateTask(taskId, title) {  
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/${taskId}`, {  
            method: 'PUT',  
            headers: this.getAuthHeaders(),  
            body: JSON.stringify({ title })  
        });  
        return this.handleResponse(response);  
    },

    // Toggle task finished status
    async finishTask(taskId) {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/${taskId}/finish`, {
            method: 'POST',
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    },

    // Move task to different slot position
    async moveTask(taskId, targetSlot) {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/${taskId}/move`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ target_slot: targetSlot })
        });
        return this.handleResponse(response);
    },

    // Delete task  
    async deleteTask(taskId) {  
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/${taskId}`, {  
            method: 'DELETE',  
            headers: this.getAuthHeaders()  
        });  
        return this.handleResponse(response);  
    }  
};
