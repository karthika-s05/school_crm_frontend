const STORAGE_KEY = "TOKEN_KEY";

export const getToken = () => localStorage.getItem(STORAGE_KEY);

export const setToken = (token) => {
  localStorage.setItem(STORAGE_KEY, token);
};

export const setUserData = (name, value) => {
  localStorage.setItem(name, value);
};

export const getUserData = (key) => localStorage.getItem(key);

export const removeToken = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const isAuthenticated = () => !!getToken();
