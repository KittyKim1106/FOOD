import { storage } from '../utils/storage';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

class ApiClient {
  async request(endpoint, options = {}) {
    const urlStr = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const url = new URL(urlStr);
    const token = storage.getToken();

    if (token && !url.pathname.startsWith('/api/auth/') && !url.pathname.startsWith('/api/foods/')) {
      url.searchParams.append('token', token);
    }

    try {
      const res = await fetch(url.toString(), {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });

      const payload = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          storage.clearAuth();
          window.location.href = '/login';
        }
        throw new Error(payload.detail || payload.message || 'API Error');
      }

      return payload;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  register(username, password, email) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, email })
    });
  }

  login(username, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  getSettings() {
    return this.request('/api/user/settings', { method: 'GET' });
  }

  updateSettings(excludedFlavors, excludedIngredients) {
    return this.request('/api/user/settings', {
      method: 'PUT',
      body: JSON.stringify({
        excluded_flavors: excludedFlavors,
        excluded_ingredients: excludedIngredients
      })
    });
  }

  getRecommendation(intent, selectedCategories, excludedCategories, excludedFlavors, excludedIngredients) {
    return this.request('/api/decision/recommend', {
      method: 'POST',
      body: JSON.stringify({
        intent,
        selected_categories: selectedCategories,
        excluded_categories: excludedCategories,
        excluded_flavors: excludedFlavors,
        excluded_ingredients: excludedIngredients
      })
    });
  }

  saveDecision(dishId, decision) {
    return this.request(`/api/decision/save?dish_id=${dishId}&decision=${decision}`, { method: 'POST' });
  }

  getHistory(limit = 10, offset = 0) {
    return this.request(`/api/user/history?limit=${limit}&offset=${offset}`, { method: 'GET' });
  }

  markFavorite(historyId) {
    return this.request(`/api/user/history/${historyId}/favorite`, { method: 'PUT' });
  }

  getCategories() {
    return this.request('/api/foods/categories', { method: 'GET' });
  }

  // 附近商家查询
  getNearbyMerchants(dishId, latitude, longitude, radiusKm = 5, serviceType = null) {
    return this.request('/api/nearby/merchants', {
      method: 'POST',
      body: JSON.stringify({
        dish_id: dishId,
        latitude,
        longitude,
        radius_km: radiusKm,
        service_type: serviceType,
      })
    });
  }
}

export const apiClient = new ApiClient();
