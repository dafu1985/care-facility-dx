const ACCESS_TOKEN_KEY = "accessToken";

/**
 * JWTを保存する。
 */
export function saveAccessToken(accessToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

/**
 * 保存されているJWTを取得する。
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * 保存されているJWTを削除する。
 */
export function removeAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}
