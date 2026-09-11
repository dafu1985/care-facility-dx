import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { MedicalConditionMaster } from '../medical-conditions/entities/medical-condition-master.entity';
import { ReplaceMedicalRequirementsDto } from './dto/replace-medical-requirements.dto';
import { CaseMedicalRequirement } from './entities/case-medical-requirement.entity';
import type { AuthenticatedUser } from '../auth/jwt.strategy';

import { CreatePlacementCaseDto } from './dto/create-placement-case.dto';
import {
  PlacementCase,
  PlacementCaseStatus,
} from './entities/placement-case.entity';
import { ClientCondition } from './entities/client-condition.entity';
import { UpsertClientConditionDto } from './dto/upsert-client-condition.dto';

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

  async upsertClientCondition(
    placementCaseId: string,
    dto: UpsertClientConditionDto,
    user: AuthenticatedUser,
  ): Promise<ClientCondition> {
    // 自分が所有している案件か確認する。
    // 存在しない案件や他のケアマネの案件なら findOne() 側で404になる。
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

  async getClientCondition(
    placementCaseId: string,
    user: AuthenticatedUser,
  ): Promise<ClientCondition> {
    // 自分の案件か確認
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

  async replaceMedicalRequirements(
    placementCaseId: string,
    dto: ReplaceMedicalRequirementsDto,
    user: AuthenticatedUser,
  ): Promise<CaseMedicalRequirement[]> {
    // 自分の案件か確認
    await this.findOne(placementCaseId, user);

    // code一覧取得
    const codes = dto.requirements.map((r) => r.code);

    // マスタ取得
    const masters = await this.medicalConditionRepository.find({
      where: {
        code: In(codes),
        isActive: true,
      },
    });

    // 全件存在チェック
    if (masters.length !== codes.length) {
      throw new NotFoundException('存在しない医療条件が含まれています。');
    }

    const masterMap = new Map(masters.map((m) => [m.code, m]));

    // 既存削除
    await this.caseMedicalRequirementRepository.delete({
      placementCaseId,
    });

    // 新規作成
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

  async getMedicalRequirements(
    placementCaseId: string,
    user: AuthenticatedUser,
  ): Promise<CaseMedicalRequirement[]> {
    // 自分の案件か確認
    await this.findOne(placementCaseId, user);

    return this.caseMedicalRequirementRepository.find({
      where: { placementCaseId },
      relations: {
        medicalCondition: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }
}
