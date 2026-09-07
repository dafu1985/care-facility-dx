import { Facility } from './entities/facility.entity';
import { FacilityResponseDto } from './dto/facility-response.dto';

export class FacilityMapper {
  static toResponse(
    facility: Facility,
  ): FacilityResponseDto {
    return {
      facilityId: facility.facilityId,
      name: facility.name,
      postalCode: facility.postalCode,
      address: facility.address,
      area: facility.area,
      phone: facility.phone,
      description: facility.description,
      status: facility.status,

      facilityType: facility.facilityType
        ? {
            facilityTypeId:
              facility.facilityType.facilityTypeId,
            name: facility.facilityType.name,
          }
        : null,

      availability: facility.availability
        ? {
            status: facility.availability.status,
            availableCount:
              facility.availability.availableCount,
            availableFrom:
              facility.availability.availableFrom,
            updatedAt:
              facility.availability.updatedAt,
          }
        : null,

      pricing: facility.pricing
        ? {
            monthlyCostMin:
              facility.pricing.monthlyCostMin,
            monthlyCostMax:
              facility.pricing.monthlyCostMax,
            entranceFee:
              facility.pricing.entranceFee,
            note: facility.pricing.note,
          }
        : null,

      requirement: facility.requirement
        ? {
            minCareLevel:
              facility.requirement.minCareLevel,
            maxCareLevel:
              facility.requirement.maxCareLevel,
            dementiaAccepted:
              facility.requirement.dementiaAccepted,
            medicalCareAccepted:
              facility.requirement.medicalCareAccepted,
            wheelchairAccepted:
              facility.requirement.wheelchairAccepted,
            endOfLifeCare:
              facility.requirement.endOfLifeCare,
            note: facility.requirement.note,
          }
        : null,
    };
  }

  static toResponseList(
    facilities: Facility[],
  ): FacilityResponseDto[] {
    return facilities.map(
      (facility) => this.toResponse(facility),
    );
  }
}