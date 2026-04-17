const TOKEN_KEY = 'food_picker_token';
const USER_ID_KEY = 'food_picker_user_id';

export const storage = {
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  getToken: () => localStorage.getItem(TOKEN_KEY),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  
  setUserId: (id) => localStorage.setItem(USER_ID_KEY, id),
  getUserId: () => localStorage.getItem(USER_ID_KEY),
  removeUserId: () => localStorage.removeItem(USER_ID_KEY),

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
  }
};
