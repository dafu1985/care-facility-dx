import { createBrowserRouter } from "react-router-dom";

import { RequireAuth } from "../features/auth/components/RequireAuth";
import { HomePage } from "../features/auth/pages/HomePage";
import { LoginPage } from "../features/auth/pages/LoginPage";

import { FacilityDetailPage } from "../features/facilities/pages/FacilityDetailPage";
import { FacilitySearchPage } from "../features/facilities/pages/FacilitySearchPage";

import { InquiryCreatePage } from "../features/inquiries/pages/InquiryCreatePage";
import { InquiryDetailPage } from "../features/inquiries/pages/InquiryDetailPage";
import { InquiryListPage } from "../features/inquiries/pages/InquiryListPage";
import { PlacementCaseCreatePage } from "../features/placement-cases/pages/PlacementCaseCreatePage";
import { PlacementCaseListPage } from "../features/placement-cases/pages/PlacementCaseListPage";
import { PlacementCaseDetailPage } from "../features/placement-cases/pages/PlacementCaseDetailPage";

/**
 * アプリケーション全体のルーティング設定。
 */
export const router = createBrowserRouter([
  /**
   * ログイン画面。
   *
   * 未認証状態でもアクセス可能。
   */
  {
    path: "/login",
    element: <LoginPage />,
  },

  /**
   * ログイン後ホーム。
   */
  {
    path: "/",
    element: (
      <RequireAuth>
        <HomePage />
      </RequireAuth>
    ),
  },

  /**
   * 問い合わせ一覧。
   */
  {
    path: "/inquiries",
    element: (
      <RequireAuth>
        <InquiryListPage />
      </RequireAuth>
    ),
  },

  /**
   * 問い合わせ詳細。
   */
  {
    path: "/inquiries/:inquiryId",
    element: (
      <RequireAuth>
        <InquiryDetailPage />
      </RequireAuth>
    ),
  },

  /**
   * 施設検索。
   */
  {
    path: "/facilities",
    element: (
      <RequireAuth>
        <FacilitySearchPage />
      </RequireAuth>
    ),
  },

  /**
   * 施設詳細。
   */
  {
    path: "/facilities/:facilityId",
    element: (
      <RequireAuth>
        <FacilityDetailPage />
      </RequireAuth>
    ),
  },

  /**
   * 施設への問い合わせ作成。
   */
  {
    path: "/facilities/:facilityId/inquiry",
    element: (
      <RequireAuth>
        <InquiryCreatePage />
      </RequireAuth>
    ),
  },

  /**
   * 施設探し案件一覧。
   */
  {
    path: "/placement-cases",
    element: (
      <RequireAuth>
        <PlacementCaseListPage />
      </RequireAuth>
    ),
  },

  /**
   * 施設探し案件詳細。
   */
  {
    path: "/placement-cases/new",
    element: (
      <RequireAuth>
        <PlacementCaseCreatePage />
      </RequireAuth>
    ),
  },

  {
    path: "/placement-cases/:placementCaseId",
    element: (
      <RequireAuth>
        <PlacementCaseDetailPage />
      </RequireAuth>
    ),
  },
]);
