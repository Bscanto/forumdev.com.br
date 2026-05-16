export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem("forumdev_token");
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }
  const stored = window.localStorage.getItem("forumdev_user");
  return stored ? JSON.parse(stored) : null;
}

export function setAuthData({ token, user }) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem("forumdev_token", token);
  window.localStorage.setItem("forumdev_user", JSON.stringify(user));
}

export function clearAuthData() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem("forumdev_token");
  window.localStorage.removeItem("forumdev_user");
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
