export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, '');

/**
 * Get the stored JWT token for admin authentication.
 * Returns null if not logged in.
 */
function getAuthToken() {
  return sessionStorage.getItem('adminToken');
}

/**
 * Build headers object, automatically attaching the JWT Bearer token
 * if one exists in sessionStorage.
 */
function buildHeaders(contentType = 'application/json') {
  const headers = {};
  if (contentType) headers['Content-Type'] = contentType;

  // [SECURITY] Attach JWT token for authenticated admin requests
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export const apiService = {
  // Generic GET request
  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: buildHeaders(null), // GET requests don't need Content-Type
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },

  // Generic POST request
  async post(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: buildHeaders('application/json'),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        // Parse error body for rate limit (429) or auth (401) messages
        const errorBody = await response.json().catch(() => ({}));
        const error = new Error(errorBody.message || errorBody.error || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  },

  // POST with file upload
  async postFormData(endpoint, formData) {
    try {
      // Don't set Content-Type header — browser sets it with the multipart boundary
      const headers = {};
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API POST FormData Error:', error);
      throw error;
    }
  },

  // Generic DELETE request (used by admin pages)
  async delete(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: buildHeaders(null),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  },

  // Generic PUT request (used by admin pages)
  async put(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: buildHeaders('application/json'),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  }
};
