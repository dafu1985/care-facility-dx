import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import type { AuthenticatedUser } from '../auth/jwt.strategy';

import {
  Facility,
  FacilityStatus,
} from '../facilities/entities/facility.entity';

import {
  FacilityMedicalCapability,
  FacilityMedicalCapabilityStatus,
} from '../facilities/entities/facility-medical-capability.entity';

import { MedicalConditionMaster } from '../medical-conditions/entities/medical-condition-master.entity';

import { CreatePlacementCaseDto } from './dto/create-placement-case.dto';
import { ReplaceMedicalRequirementsDto } from './dto/replace-medical-requirements.dto';
import { UpsertClientConditionDto } from './dto/upsert-client-condition.dto';

import {
  CandidateFacility,
  CandidateFacilityStatus,
} from './entities/candidate-facility.entity';

import {
  CaseMedicalRequirement,
  MedicalRequirementLevel,
} from './entities/case-medical-requirement.entity';

import { ClientCondition } from './entities/client-condition.entity';

import {
  PlacementCase,
  PlacementCaseStatus,
} from './entities/placement-case.entity';

import {
  AvailabilityStatus,
  FacilityAvailability,
} from '../facilities/entities/facility-availability.entity';
import { FacilityPricing } from '../facilities/entities/facility-pricing.entity';
import { FacilityRequirement } from '../facilities/entities/facility-requirement.entity';

@Injectable()
export class PlacementCasesService {
  constructor(
    @InjectRepository(PlacementCase)
    private readonly placementCaseRepository: Repository<PlacementCase>,

    @InjectRepository(ClientCondition)
    private readonly clientConditionRepository: Repository<ClientCondition>,

    @InjectRepository(CaseMedicalRequirement)
    private readonly caseMedicalRequirementRepository: Repository<CaseMedicalRequirement>,

    @InjectRepository(MedicalConditionMaster)
    private readonly medicalConditionRepository: Repository<MedicalConditionMaster>,

    @InjectRepository(CandidateFacility)
    private readonly candidateFacilityRepository: Repository<CandidateFacility>,

    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,

    @InjectRepository(FacilityMedicalCapability)
    private readonly facilityMedicalCapabilityRepository: Repository<FacilityMedicalCapability>,

    @InjectRepository(FacilityAvailability)
    private readonly facilityAvailabilityRepository: Repository<FacilityAvailability>,

    @InjectRepository(FacilityPricing)
    private readonly facilityPricingRepository: Repository<FacilityPricing>,

    @InjectRepository(FacilityRequirement)
    private readonly facilityRequirementRepository: Repository<FacilityRequirement>,
  ) {}

  /**
   * 施設探し案件を作成する。
   */
  async create(
    dto: CreatePlacementCaseDto,
    user: AuthenticatedUser,
  ): Promise<PlacementCase> {
    const caseCode = await this.generateCaseCode();

    const placementCase = this.placementCaseRepository.create({
      careManagerId: user.userId,
      caseCode,
      status: PlacementCaseStatus.SEARCHING,
      desiredMoveInDate: dto.desiredMoveInDate ?? null,
      urgency: dto.urgency ?? null,
      note: dto.note ?? null,
    });

    return this.placementCaseRepository.save(placementCase);
  }

  /**
   * ログイン中のケアマネジャー自身の案件一覧を取得する。
   */
  async findAll(user: AuthenticatedUser): Promise<PlacementCase[]> {
    return this.placementCaseRepository.find({
      where: {
        careManagerId: user.userId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * ログイン中のケアマネジャー自身の案件を1件取得する。
   */
  async findOne(
    placementCaseId: string,
    user: AuthenticatedUser,
  ): Promise<PlacementCase> {
    const placementCase = await this.placementCaseRepository.findOne({
      where: {
        placementCaseId,
        careManagerId: user.userId,
      },
    });

    if (!placementCase) {
      throw new NotFoundException('施設探し案件が見つかりません。');
    }

    return placementCase;
  }

  /**
   * 利用者条件を新規登録または更新する。
   */
  async upsertClientCondition(
    placementCaseId: string,
    dto: UpsertClientConditionDto,
    user: AuthenticatedUser,
  ): Promise<ClientCondition> {
    // 自分が所有している案件か確認する。
    await this.findOne(placementCaseId, user);

    // すでに条件が登録されているか確認する。
    const existingCondition = await this.clientConditionRepository.findOne({
      where: {
        placementCaseId,
      },
    });

    if (existingCondition) {
      // 既存データがある場合は更新する。
      this.clientConditionRepository.merge(existingCondition, dto);

      return this.clientConditionRepository.save(existingCondition);
    }

    // 初回登録の場合は新規作成する。
    const clientCondition = this.clientConditionRepository.create({
      placementCaseId,
      ageGroup: dto.ageGroup ?? null,
      gender: dto.gender ?? null,
      careLevel: dto.careLevel ?? null,
      budgetMax: dto.budgetMax ?? null,
      desiredArea: dto.desiredArea ?? null,
      publicAssistance: dto.publicAssistance ?? null,
      guarantorAvailable: dto.guarantorAvailable ?? null,
      dementia: dto.dementia ?? null,
      endOfLifeCare: dto.endOfLifeCare ?? null,
      desiredMoveInDate: dto.desiredMoveInDate ?? null,
    });

    return this.clientConditionRepository.save(clientCondition);
  }

  /**
   * 案件管理コードを生成する。
   *
   * 例:
   * NIG-000001
   * NIG-000002
   */
  private async generateCaseCode(): Promise<string> {
    const latestCase = await this.placementCaseRepository
      .createQueryBuilder('placementCase')
      .where('placementCase.caseCode LIKE :prefix', {
        prefix: 'NIG-%',
      })
      .orderBy('placementCase.caseCode', 'DESC')
      .getOne();

    if (!latestCase) {
      return 'NIG-000001';
    }

    const currentNumber = Number(latestCase.caseCode.replace('NIG-', ''));

    const nextNumber = currentNumber + 1;

    return `NIG-${String(nextNumber).padStart(6, '0')}`;
  }

  /**
   * 案件に紐づく利用者条件を取得する。
   */
  async getClientCondition(
    placementCaseId: string,
    user: AuthenticatedUser,
  ): Promise<ClientCondition> {
    // 自分の案件か確認する。
    await this.findOne(placementCaseId, user);

    const clientCondition = await this.clientConditionRepository.findOne({
      where: {
        placementCaseId,
      },
    });

    if (!clientCondition) {
      throw new NotFoundException('利用者条件が見つかりません。');
    }

    return clientCondition;
  }

  /**
   * 案件に紐づく医療条件を全置換する。
   */
  async replaceMedicalRequirements(
    placementCaseId: string,
    dto: ReplaceMedicalRequirementsDto,
    user: AuthenticatedUser,
  ): Promise<CaseMedicalRequirement[]> {
    // 自分の案件か確認する。
    await this.findOne(placementCaseId, user);

    // リクエスト内の医療条件コード一覧を取得する。
    const codes = dto.requirements.map((requirement) => requirement.code);

    // 有効な医療条件マスタを取得する。
    const masters = await this.medicalConditionRepository.find({
      where: {
        code: In(codes),
        isActive: true,
      },
    });

    // 指定された医療条件がすべて存在するか確認する。
    if (masters.length !== codes.length) {
      throw new NotFoundException('存在しない医療条件が含まれています。');
    }

    const masterMap = new Map(masters.map((master) => [master.code, master]));

    // 既存の医療条件を削除する。
    await this.caseMedicalRequirementRepository.delete({
      placementCaseId,
    });

    // 新しい医療条件を作成する。
    const entities = dto.requirements.map((item) =>
      this.caseMedicalRequirementRepository.create({
        placementCaseId,
        medicalConditionId: masterMap.get(item.code)!.medicalConditionId,
        requirementLevel: item.requirementLevel,
        note: item.note ?? null,
      }),
    );

    return this.caseMedicalRequirementRepository.save(entities);
  }

  /**
   * 案件に紐づく医療条件を取得する。
   */
  async getMedicalRequirements(
    placementCaseId: string,
    user: AuthenticatedUser,
  ): Promise<CaseMedicalRequirement[]> {
    // 自分の案件か確認する。
    await this.findOne(placementCaseId, user);

    return this.caseMedicalRequirementRepository.find({
      where: {
        placementCaseId,
      },
      relations: {
        medicalCondition: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  /**
   * 案件に対して施設マッチングを実行する。
   *
   * MVPでは利用者の要介護度と医療条件を使って判定する。
   *
   * 処理:
   * 1. 自分の案件か確認
   * 2. 案件の医療条件・利用者条件を取得
   * 3. ACTIVE施設を取得
   * 4. 要介護度の受入条件を判定
   * 5. 各施設の医療対応能力を取得
   * 6. REQUIRED条件を満たさない施設を除外
   * 7. 医療条件スコアを計算
   * 8. CandidateFacilityへ保存
   */
  async runMatching(
    placementCaseId: string,
    user: AuthenticatedUser,
  ): Promise<CandidateFacility[]> {
    // 自分の案件か確認する。
    await this.findOne(placementCaseId, user);

    // 案件の医療条件を取得する。
    const requirements = await this.caseMedicalRequirementRepository.find({
      where: {
        placementCaseId,
      },
    });

    // 利用者条件を取得する。
    // 未登録の場合もマッチング自体は実行できるようにする。
    const clientCondition = await this.clientConditionRepository.findOne({
      where: {
        placementCaseId,
      },
    });

    // ACTIVEな施設だけをマッチング対象にする。
    const facilities = await this.facilityRepository.find({
      where: {
        status: FacilityStatus.ACTIVE,
      },
    });

    const candidates: CandidateFacility[] = [];

    for (const facility of facilities) {
      // 施設の受入条件を取得する。
      const facilityRequirement =
        await this.facilityRequirementRepository.findOne({
          where: {
            facilityId: facility.facilityId,
          },
        });

      // 施設の料金情報を取得する。
      const facilityPricing = await this.facilityPricingRepository.findOne({
        where: {
          facilityId: facility.facilityId,
        },
      });

      // 施設の空床情報を取得する。
      const facilityAvailability =
        await this.facilityAvailabilityRepository.findOne({
          where: {
            facilityId: facility.facilityId,
          },
        });

      // 利用者の要介護度が施設の受入範囲内か判定する。
      const satisfiesCareLevel = this.satisfiesCareLevelCondition(
        clientCondition,
        facilityRequirement,
      );

      // 要介護度の受入条件を満たさない施設は候補から除外する。
      if (!satisfiesCareLevel) {
        continue;
      }

      // 利用者の予算上限内に施設の最低月額費用が収まっているか判定する。
      const satisfiesBudget = this.satisfiesBudgetCondition(
        clientCondition,
        facilityPricing,
      );

      // 予算条件を満たさない施設は候補から除外する。
      if (!satisfiesBudget) {
        continue;
      }

      // 認知症の受入条件を満たしているか判定する。
      const satisfiesDementia = this.satisfiesDementiaCondition(
        clientCondition,
        facilityRequirement,
      );

      // 認知症の受入条件を満たさない施設は候補から除外する。
      if (!satisfiesDementia) {
        continue;
      }

      // 終末期ケアの受入条件を満たしているか判定する。
      const satisfiesEndOfLifeCare = this.satisfiesEndOfLifeCareCondition(
        clientCondition,
        facilityRequirement,
      );

      // 終末期ケアの受入条件を満たさない施設は候補から除外する。
      if (!satisfiesEndOfLifeCare) {
        continue;
      }

      // 施設の医療対応能力を取得する。
      const capabilities = await this.facilityMedicalCapabilityRepository.find({
        where: {
          facilityId: facility.facilityId,
        },
      });

      // REQUIRED条件を満たさない施設は除外する。
      const satisfiesRequired = this.satisfiesRequiredMedicalConditions(
        requirements,
        capabilities,
      );

      if (!satisfiesRequired) {
        continue;
      }

      // 医療条件をもとにスコアを計算する。
      const medicalScore = this.calculateMedicalMatchScore(
        requirements,
        capabilities,
      );

      // 希望エリアとの一致度をスコアへ加算する。
      const areaScore = this.calculateAreaMatchScore(clientCondition, facility);

      // 空床状況と入居希望日をもとにスコアを加算する。
      const availabilityScore = this.calculateAvailabilityMatchScore(
        clientCondition,
        facilityAvailability,
      );

      const matchScore = medicalScore + areaScore + availabilityScore;

      const candidate = this.candidateFacilityRepository.create({
        placementCaseId,
        facilityId: facility.facilityId,
        matchScore,
        status: CandidateFacilityStatus.CONSIDERING,
        note: null,
      });

      candidates.push(candidate);
    }

    // 既存のマッチング結果を削除して再作成する。
    await this.candidateFacilityRepository.delete({
      placementCaseId,
    });

    if (candidates.length === 0) {
      return [];
    }

    return this.candidateFacilityRepository.save(candidates);
  }

  /**
   * 案件に紐づく候補施設一覧を取得する。
   *
   * マッチングスコアが高い施設から順に返す。
   * Facility Relationも取得し、
   * FE側で施設名・住所・エリアなどを表示できるようにする。
   */
  async getCandidateFacilities(
    placementCaseId: string,
    user: AuthenticatedUser,
  ): Promise<CandidateFacility[]> {
    // 自分の案件か確認する。
    await this.findOne(placementCaseId, user);

    return this.candidateFacilityRepository.find({
      where: {
        placementCaseId,
      },
      relations: {
        facility: true,
      },
      order: {
        matchScore: 'DESC',
        createdAt: 'ASC',
      },
    });
  }

  /**
   * 利用者の要介護度が施設の受入範囲内か判定する。
   *
   * 利用者側に要介護度が未設定の場合は判定対象外とする。
   * 施設側のmin/maxがnullの場合は、その方向の制限なしとして扱う。
   */
  private satisfiesCareLevelCondition(
    clientCondition: ClientCondition | null,
    requirement: FacilityRequirement | null,
  ): boolean {
    // 利用者側に要介護度が設定されていない場合は除外しない。
    if (!clientCondition || clientCondition.careLevel === null) {
      return true;
    }

    // 利用者側に条件があるのに施設側の受入条件が未登録の場合は、
    // 安全側に倒して候補から除外する。
    if (!requirement) {
      return false;
    }

    // ClientCondition.careLevel は "CARE_1" ～ "CARE_5" の形式で保持される。
    // 数値部分だけを取り出して施設側の min/max と比較する。
    const careLevelMatch = clientCondition.careLevel.match(/^CARE_(\d+)$/);

    // 想定外の形式の場合は安全側に倒して候補から除外する。
    if (!careLevelMatch) {
      return false;
    }

    const careLevel = Number(careLevelMatch[1]);

    if (Number.isNaN(careLevel)) {
      return false;
    }

    // 施設の最低要介護度を下回る場合は対象外。
    if (
      requirement.minCareLevel !== null &&
      careLevel < requirement.minCareLevel
    ) {
      return false;
    }

    // 施設の最高要介護度を上回る場合は対象外。
    if (
      requirement.maxCareLevel !== null &&
      careLevel > requirement.maxCareLevel
    ) {
      return false;
    }

    return true;
  }

  /**
   * 利用者の予算上限内に施設の最低月額費用が収まっているか判定する。
   *
   * 利用者側に予算上限が未設定の場合は判定対象外とする。
   * 施設側の料金情報が未登録の場合は、安全側に倒して候補から除外する。
   */
  private satisfiesBudgetCondition(
    clientCondition: ClientCondition | null,
    pricing: FacilityPricing | null,
  ): boolean {
    // 利用者側に予算上限が設定されていない場合は除外しない。
    if (!clientCondition || clientCondition.budgetMax === null) {
      return true;
    }

    // 利用者側に予算条件があるのに施設側の料金情報が未登録の場合は除外する。
    if (!pricing) {
      return false;
    }

    // 施設の最低月額費用が予算上限を超えている場合は対象外。
    if (pricing.monthlyCostMin > clientCondition.budgetMax) {
      return false;
    }

    return true;
  }

  /**
   * 認知症の受入条件を満たしているか判定する。
   *
   * 利用者側で認知症対応が必要でない場合は判定対象外とする。
   * 認知症対応が必要なのに施設側の受入条件が未登録の場合は、
   * 安全側に倒して候補から除外する。
   */
  private satisfiesDementiaCondition(
    clientCondition: ClientCondition | null,
    requirement: FacilityRequirement | null,
  ): boolean {
    // 認知症対応が必要でない場合は除外しない。
    if (!clientCondition || clientCondition.dementia !== true) {
      return true;
    }

    // 施設側の受入条件が未登録の場合は除外する。
    if (!requirement) {
      return false;
    }

    // 認知症受入可能な施設だけ候補に残す。
    return requirement.dementiaAccepted === true;
  }

  /**
   * 終末期ケアの受入条件を満たしているか判定する。
   *
   * 利用者側で終末期ケアが必要でない場合は判定対象外とする。
   * 必要なのに施設側の受入条件が未登録の場合は、
   * 安全側に倒して候補から除外する。
   */
  private satisfiesEndOfLifeCareCondition(
    clientCondition: ClientCondition | null,
    requirement: FacilityRequirement | null,
  ): boolean {
    // 終末期ケアが必要でない場合は除外しない。
    if (!clientCondition || clientCondition.endOfLifeCare !== true) {
      return true;
    }

    // 施設側の受入条件が未登録の場合は除外する。
    if (!requirement) {
      return false;
    }

    // 終末期ケア対応可能な施設だけ候補に残す。
    return requirement.endOfLifeCare === true;
  }

  /**
   * 希望エリアに一致する場合のスコアを計算する。
   *
   * 希望エリアが未設定の場合は加点しない。
   * 完全一致または部分一致した場合に加点する。
   */
  private calculateAreaMatchScore(
    clientCondition: ClientCondition | null,
    facility: Facility,
  ): number {
    if (!clientCondition?.desiredArea) {
      return 0;
    }

    if (!facility.area) {
      return 0;
    }

    const desiredArea = clientCondition.desiredArea.trim();
    const facilityArea = facility.area.trim();

    if (!desiredArea || !facilityArea) {
      return 0;
    }

    if (facilityArea === desiredArea) {
      return 10;
    }

    if (
      facilityArea.includes(desiredArea) ||
      desiredArea.includes(facilityArea)
    ) {
      return 5;
    }

    return 0;
  }

  /**
   * 空床状況と入居希望日をもとにスコアを計算する。
   *
   * 空床情報はHard Filterにはせず、候補を残したまま優先順位へ反映する。
   *
   * 空床状態:
   * AVAILABLE     +10
   * FEW            +7
   * CONSULTATION   +3
   * FULL            +0
   * SUSPENDED       +0
   * UNKNOWN         +0
   *
   * 入居希望日:
   * availableFrom が希望日以前なら +5
   */
  private calculateAvailabilityMatchScore(
    clientCondition: ClientCondition | null,
    availability: FacilityAvailability | null,
  ): number {
    if (!availability) {
      return 0;
    }

    let score = 0;

    switch (availability.status) {
      case AvailabilityStatus.AVAILABLE:
        score += 10;
        break;

      case AvailabilityStatus.FEW:
        score += 7;
        break;

      case AvailabilityStatus.CONSULTATION:
        score += 3;
        break;

      case AvailabilityStatus.FULL:
      case AvailabilityStatus.SUSPENDED:
      case AvailabilityStatus.UNKNOWN:
        break;
    }

    if (
      clientCondition?.desiredMoveInDate &&
      availability.availableFrom &&
      availability.availableFrom <= clientCondition.desiredMoveInDate
    ) {
      score += 5;
    }

    return score;
  }

  /**
   * 必須医療条件を施設が満たしているか判定する。
   *
   * REQUIRED の条件について、
   * UNAVAILABLE または施設側に登録がない場合は候補から除外する。
   *
   * CONSULTATION は完全対応ではないが、
   * MVPでは「要相談候補」として除外しない。
   */
  private satisfiesRequiredMedicalConditions(
    requirements: CaseMedicalRequirement[],
    capabilities: FacilityMedicalCapability[],
  ): boolean {
    // REQUIRED の医療条件だけを抽出する。
    const requiredConditions = requirements.filter(
      (requirement) =>
        requirement.requirementLevel === MedicalRequirementLevel.REQUIRED,
    );

    return requiredConditions.every((requirement) => {
      // 同じ医療条件に対する施設側の対応能力を取得する。
      const capability = capabilities.find(
        (item) => item.medicalConditionId === requirement.medicalConditionId,
      );

      // 施設側に登録がない場合は、
      // 安全側に倒して候補から除外する。
      if (!capability) {
        return false;
      }

      // 明示的に対応不可なら候補から除外する。
      if (capability.status === FacilityMedicalCapabilityStatus.UNAVAILABLE) {
        return false;
      }

      // AVAILABLE / CONSULTATION は候補として残す。
      return true;
    });
  }

  /**
   * 医療条件をもとに施設のマッチングスコアを計算する。
   *
   * MVPでは以下のルールで加点する。
   *
   * REQUIRED
   *   AVAILABLE     +20
   *   CONSULTATION  +10
   *
   * PREFERRED
   *   AVAILABLE     +10
   *   CONSULTATION   +5
   *
   * UNAVAILABLE / 未登録
   *   +0
   */
  private calculateMedicalMatchScore(
    requirements: CaseMedicalRequirement[],
    capabilities: FacilityMedicalCapability[],
  ): number {
    let score = 0;

    for (const requirement of requirements) {
      const capability = capabilities.find(
        (item) => item.medicalConditionId === requirement.medicalConditionId,
      );

      if (!capability) {
        continue;
      }

      if (requirement.requirementLevel === MedicalRequirementLevel.REQUIRED) {
        if (capability.status === FacilityMedicalCapabilityStatus.AVAILABLE) {
          score += 20;
        } else if (
          capability.status === FacilityMedicalCapabilityStatus.CONSULTATION
        ) {
          score += 10;
        }

        continue;
      }

      if (requirement.requirementLevel === MedicalRequirementLevel.PREFERRED) {
        if (capability.status === FacilityMedicalCapabilityStatus.AVAILABLE) {
          score += 10;
        } else if (
          capability.status === FacilityMedicalCapabilityStatus.CONSULTATION
        ) {
          score += 5;
        }
      }
    }

    return score;
  }
}
