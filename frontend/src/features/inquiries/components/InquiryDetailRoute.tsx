import { useParams } from "react-router-dom";

import { InquiryDetailPage } from "../pages/InquiryDetailPage";

/**
 * 問い合わせ詳細画面のルートラッパー。
 *
 * 問い合わせIDが変更された場合、
 * InquiryDetailPageを再マウントして
 * 画面内の状態を初期化する。
 */
export function InquiryDetailRoute() {
  const { inquiryId } = useParams<{
    inquiryId: string;
  }>();

  return <InquiryDetailPage key={inquiryId} />;
}
