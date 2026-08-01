import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export function getAccessToken() {
  return Cookies.get(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  Cookies.set(ACCESS_TOKEN_KEY, token);
}

export function getRefreshToken() {
  return Cookies.get(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string) {
  Cookies.set(REFRESH_TOKEN_KEY, token, { expires: 30 });
}

export function clearTokens() {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
}
