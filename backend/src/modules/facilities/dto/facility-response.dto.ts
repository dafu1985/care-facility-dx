export class FacilityTypeResponseDto {
  facilityTypeId: string;
  name: string;
}

export class FacilityAvailabilityResponseDto {
  status: string;
  availableCount: number | null;
  availableFrom: string | null;
  updatedAt: Date;
}

export class FacilityPricingResponseDto {
  monthlyCostMin: number;
  monthlyCostMax: number;
  entranceFee: number;
  note: string | null;
}

export class FacilityRequirementResponseDto {
  minCareLevel: number | null;
  maxCareLevel: number | null;
  dementiaAccepted: boolean;
  medicalCareAccepted: boolean;
  wheelchairAccepted: boolean;
  endOfLifeCare: boolean;
  note: string | null;
}

export class FacilityResponseDto {
  facilityId: string;
  name: string;
  postalCode: string | null;
  address: string | null;
  area: string;
  phone: string | null;
  description: string | null;
  status: string;

  facilityType: FacilityTypeResponseDto | null;
  availability: FacilityAvailabilityResponseDto | null;
  pricing: FacilityPricingResponseDto | null;
  requirement: FacilityRequirementResponseDto | null;
}

export class FacilityListResponseDto {
  items: FacilityResponseDto[];
  page: number;
  pageSize: number;
  total: number;
}
