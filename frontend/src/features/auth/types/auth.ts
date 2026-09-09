/**
 * ログインリクエスト。
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * ログインレスポンス。
 */
export interface LoginResponse {
  accessToken: string;
}

/**
 * ユーザー権限。
 *
 * BackendのUserRoleと合わせる。
 */
export type UserRole = "ADMIN" | "CARE_MANAGER" | "FACILITY";

/**
 * ログインユーザー情報。
 *
 * GET /auth/me のレスポンス。
 */
export interface AuthMeResponse {
  userId: string;
  email: string;
  role: UserRole;

  /**
   * FACILITYユーザーの場合は所属施設ID。
   *
   * ADMIN / CARE_MANAGERの場合はnull。
   */
  facilityId: string | null;
}
