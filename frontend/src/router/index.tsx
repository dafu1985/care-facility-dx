import { createBrowserRouter } from "react-router-dom";

import { LoginPage } from "../features/auth/pages/LoginPage";
import { HomePage } from "../features/auth/pages/HomePage";
import { InquiryListPage } from "../features/inquiries/pages/InquiryListPage";
import { InquiryDetailPage } from "../features/inquiries/pages/InquiryDetailPage";
import { FacilitySearchPage } from "../features/facilities/pages/FacilitySearchPage";
import { FacilityDetailPage } from "../features/facilities/pages/FacilityDetailPage";
import { InquiryCreatePage } from "../features/inquiries/pages/InquiryCreatePage";

/**
 * アプリケーション全体のルーティング設定。
 */
export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
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
]);
