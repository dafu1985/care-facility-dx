/**
 * 医療条件の重要度。
 */
export type MedicalRequirementLevel =
  | "REQUIRED"
  | "PREFERRED";

/**
 * 医療条件マスタ。
 */
export interface MedicalCondition {
  medicalConditionId: string;
  code: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 案件に紐づく医療条件。
 */
export interface CaseMedicalRequirement {
  caseMedicalRequirementId: string;
  placementCaseId: string;
  medicalConditionId: string;
  requirementLevel: MedicalRequirementLevel;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  medicalCondition: MedicalCondition;
}
