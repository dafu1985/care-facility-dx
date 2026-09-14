import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import type { AuthenticatedUser } from '../auth/jwt.strategy';
import {
  Facility,
  FacilityStatus,
} from '../facilities/entities/facility.entity';
import { UserRole } from '../users/entities/user.entity';

import {
  CandidateFacility,
  CandidateFacilityStatus,
} from './entities/candidate-facility.entity';
import {
  PlacementCase,
  PlacementCaseStatus,
} from './entities/placement-case.entity';
import { PlacementCasesService } from './placement-cases.service';

describe('PlacementCasesService matching', () => {
  const placementCaseId = '4d3b87cb-5096-4b26-be90-0ff915b1d6d2';
  const facilityId = '5ea06a45-7587-4198-b94c-56e0044399c7';
  const candidateFacilityId = 'b0ebacd6-4f0a-4dbc-a9b7-4bf8509470b7';
  const careManagerId = '01541a48-ac15-4279-ac45-166b923f14c9';

  const placementCaseRepository = {
    findOne: jest.fn(),
  };

  const clientConditionRepository = {
    findOne: jest.fn(),
  };

  const caseMedicalRequirementRepository = {
    find: jest.fn(),
  };

  const medicalConditionRepository = {};

  const candidateFacilityRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const facilityRepository = {
    find: jest.fn(),
  };

  const facilityMedicalCapabilityRepository = {
    find: jest.fn(),
  };

  const facilityAvailabilityRepository = {
    findOne: jest.fn(),
  };

  const facilityPricingRepository = {
    findOne: jest.fn(),
  };

  const facilityRequirementRepository = {
    findOne: jest.fn(),
  };

  let service: PlacementCasesService;

  const user: AuthenticatedUser = {
    userId: careManagerId,
    role: UserRole.CARE_MANAGER,
    email: 'caremanager@example.com',
  };

  const placementCase = {
    placementCaseId,
    careManagerId,
    caseCode: 'NIG-000001',
    status: PlacementCaseStatus.INQUIRING,
    desiredMoveInDate: null,
    urgency: null,
    note: null,
    createdAt: new Date('2026-09-11T00:00:00.000Z'),
    updatedAt: new Date('2026-09-11T00:00:00.000Z'),
  } as PlacementCase;

  const facility = {
    facilityId,
    facilityTypeId: '11111111-1111-4111-8111-111111111111',
    name: 'テスト介護ホーム',
    postalCode: '950-0000',
    address: '新潟県新潟市',
    area: '新潟市江南区',
    phone: null,
    description: null,
    status: FacilityStatus.ACTIVE,
    createdAt: new Date('2026-09-11T00:00:00.000Z'),
    updatedAt: new Date('2026-09-11T00:00:00.000Z'),
  } as Facility;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new PlacementCasesService(
      placementCaseRepository as never,
      clientConditionRepository as never,
      caseMedicalRequirementRepository as never,
      medicalConditionRepository as never,
      candidateFacilityRepository as never,
      facilityRepository as never,
      facilityMedicalCapabilityRepository as never,
      facilityAvailabilityRepository as never,
      facilityPricingRepository as never,
      facilityRequirementRepository as never,
    );

    placementCaseRepository.findOne.mockResolvedValue(placementCase);
    clientConditionRepository.findOne.mockResolvedValue(null);
    caseMedicalRequirementRepository.find.mockResolvedValue([]);
    facilityRepository.find.mockResolvedValue([facility]);

    facilityRequirementRepository.findOne.mockResolvedValue(null);
    facilityPricingRepository.findOne.mockResolvedValue(null);
    facilityAvailabilityRepository.findOne.mockResolvedValue(null);
    facilityMedicalCapabilityRepository.find.mockResolvedValue([]);
  });

  it('再マッチング時に既存候補のID・ステータス・メモを維持する', async () => {
    const existingCandidate = {
      candidateFacilityId,
      placementCaseId,
      facilityId,
      matchScore: 99,
      status: CandidateFacilityStatus.INQUIRING,
      note: '問い合わせ中の候補',
      createdAt: new Date('2026-09-11T00:00:00.000Z'),
      updatedAt: new Date('2026-09-11T00:00:00.000Z'),
    } as CandidateFacility;

    candidateFacilityRepository.find.mockResolvedValue([existingCandidate]);
    candidateFacilityRepository.save.mockImplementation(
      async (candidates) => candidates,
    );

    const result = await service.runMatching(placementCaseId, user);

    expect(result).toHaveLength(1);

    expect(result[0].candidateFacilityId).toBe(candidateFacilityId);
    expect(result[0].status).toBe(CandidateFacilityStatus.INQUIRING);
    expect(result[0].note).toBe('問い合わせ中の候補');

    // 条件なしの場合は各スコアが0になるため、最新値の0へ更新される。
    expect(result[0].matchScore).toBe(0);

    // 既存候補を再利用するため、新しいCandidateFacilityは作成しない。
    expect(candidateFacilityRepository.create).not.toHaveBeenCalled();

    expect(candidateFacilityRepository.save).toHaveBeenCalledWith([
      existingCandidate,
    ]);
  });
});