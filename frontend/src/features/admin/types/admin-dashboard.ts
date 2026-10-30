/**
 * 管理者ダッシュボードのAPIレスポンス。
 */
export interface AdminDashboardResponse {
  /** 登録施設数 */
  facilityCount: number;

  /** ケアマネジャー数 */
  careManagerCount: number;

  /** 問い合わせ総数 */
  inquiryCount: number;

  /** 未対応問い合わせ数 */
  openInquiryCount: number;
}
