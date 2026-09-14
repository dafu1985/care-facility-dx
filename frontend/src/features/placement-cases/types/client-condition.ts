/**
 * 利用者条件。
 *
 * Backend ClientCondition Entity / APIレスポンスに対応するFrontend型。
 */
export interface ClientCondition {
  clientConditionId: string;
  placementCaseId: string;
  ageGroup: string | null;
  gender: string | null;
  careLevel: string | null;
  budgetMax: number | null;
  desiredArea: string | null;
  publicAssistance: boolean;
  guarantorAvailable: boolean;
  dementia: boolean;
  endOfLifeCare: boolean;
  desiredMoveInDate: string | null;
  createdAt: string;
  updatedAt: string;
}
