const STORAGE_KEY = "TOKEN_KEY";
const REMEMBERED_USERNAME_KEY = "rememberedUsername";

const notifyAuthChanged = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth-changed"));
  }
};

export const getToken = () =>
  localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);

/** Always persist auth token in localStorage. */
export const setToken = (token) => {
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, token);
};

export const setUserData = (name, value) => {
  localStorage.setItem(name, value);
};

export const getUserData = (key) => localStorage.getItem(key);

export const removeToken = () => {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  notifyAuthChanged();
};

export const isAuthenticated = () => !!getToken();

export const getRememberedUsername = () =>
  localStorage.getItem(REMEMBERED_USERNAME_KEY) || "";

export const setRememberedUsername = (username) => {
  if (username) localStorage.setItem(REMEMBERED_USERNAME_KEY, username);
  else localStorage.removeItem(REMEMBERED_USERNAME_KEY);
};

export const POST_LOGIN_REDIRECT_KEY = "postLoginRedirect";

export { notifyAuthChanged };
