import { createBrowserRouter } from "react-router-dom";

import { AuthenticatedLayout } from "../components/layout/AuthenticatedLayout";

import { RequireAuth } from "../features/auth/components/RequireAuth";
import { HomePage } from "../features/auth/pages/HomePage";
import { LoginPage } from "../features/auth/pages/LoginPage";

import { FacilityDetailPage } from "../features/facilities/pages/FacilityDetailPage";
import { FacilitySearchPage } from "../features/facilities/pages/FacilitySearchPage";

import { InquiryCreatePage } from "../features/inquiries/pages/InquiryCreatePage";
import { InquiryDetailPage } from "../features/inquiries/pages/InquiryDetailPage";
import { InquiryListPage } from "../features/inquiries/pages/InquiryListPage";

import { ClientConditionEditPage } from "../features/placement-cases/pages/ClientConditionEditPage";
import { MedicalRequirementsEditPage } from "../features/placement-cases/pages/MedicalRequirementsEditPage";
import { PlacementCaseCreatePage } from "../features/placement-cases/pages/PlacementCaseCreatePage";
import { PlacementCaseDetailPage } from "../features/placement-cases/pages/PlacementCaseDetailPage";
import { PlacementCaseListPage } from "../features/placement-cases/pages/PlacementCaseListPage";

/**
 * アプリケーション全体のルーティング設定。
 */
export const router = createBrowserRouter([
  /**
   * 未認証ユーザーもアクセスできるログイン画面。
   */
  {
    path: "/login",
    element: <LoginPage />,
  },

  /**
   * ログイン後の画面。
   *
   * RequireAuthで認証を確認し、
   * AuthenticatedLayoutを全ページで共有する。
   */
  {
    element: (
      <RequireAuth>
        <AuthenticatedLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/inquiries",
        element: <InquiryListPage />,
      },
      {
        path: "/inquiries/:inquiryId",
        element: <InquiryDetailPage />,
      },
      {
        path: "/facilities",
        element: <FacilitySearchPage />,
      },
      {
        path: "/facilities/:facilityId",
        element: <FacilityDetailPage />,
      },
      {
        path: "/facilities/:facilityId/inquiry",
        element: <InquiryCreatePage />,
      },
      {
        path: "/placement-cases",
        element: <PlacementCaseListPage />,
      },
      {
        path: "/placement-cases/new",
        element: <PlacementCaseCreatePage />,
      },
      {
        path: "/placement-cases/:placementCaseId/conditions",
        element: <ClientConditionEditPage />,
      },
      {
        path: "/placement-cases/:placementCaseId/medical-requirements",
        element: <MedicalRequirementsEditPage />,
      },
      {
        path: "/placement-cases/:placementCaseId",
        element: <PlacementCaseDetailPage />,
      },
    ],
  },
]);
