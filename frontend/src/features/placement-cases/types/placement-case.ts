/**
 * 施設探し案件のステータス。
 */
export type PlacementCaseStatus =
  | "SEARCHING"
  | "INQUIRING"
  | "VISITING"
  | "APPLYING"
  | "COMPLETED"
  | "CANCELLED";

/**
 * 施設探し案件。
 *
 * Backend PlacementCase Entity / APIレスポンスに対応するFrontend型。
 */
export interface PlacementCase {
  placementCaseId: string;
  careManagerId: string;
  caseCode: string;
  status: PlacementCaseStatus;
  desiredMoveInDate: string | null;
  urgency: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}
