/**
 * 問い合わせメッセージ本文の最大文字数。
 *
 * BackendのINQUIRY_MESSAGE_MAX_LENGTHと
 * 同じ値を維持すること。
 */
export const INQUIRY_MESSAGE_MAX_LENGTH = 2000;

/**
 * 問い合わせメッセージ本文を正規化する。
 *
 * 前後の空白を除去し、本文途中の改行は維持する。
 */
export function normalizeInquiryMessageBody(body: string): string {
  return body.trim();
}

/**
 * 正規化後のメッセージ本文の文字数を取得する。
 *
 * Unicodeコードポイント単位でカウントする。
 */
export function getInquiryMessageLength(body: string): number {
  return Array.from(normalizeInquiryMessageBody(body)).length;
}

/**
 * メッセージ本文が最大文字数を超えているか判定する。
 */
export function isInquiryMessageTooLong(body: string): boolean {
  return getInquiryMessageLength(body) > INQUIRY_MESSAGE_MAX_LENGTH;
}

/**
 * メッセージ本文が送信可能な内容か判定する。
 *
 * ステータスやアクセス権限の判定は行わない。
 */
export function isInquiryMessageValid(body: string): boolean {
  const length = getInquiryMessageLength(body);

  return length > 0 && length <= INQUIRY_MESSAGE_MAX_LENGTH;
}
