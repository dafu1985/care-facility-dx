import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { UserRole } from '../users/entities/user.entity';

import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { CreateInquiryMessageDto } from './dto/create-inquiry-message.dto';
import { InquirySearchDto } from './dto/inquiry-search.dto';
import { UpdateInquiryStatusDto } from './dto/update-inquiry-status.dto';
import {
  CreateInquiryResponseDto,
  InquiryListResponseDto,
  InquiryMessageResponseDto,
  InquiryResponseDto,
} from './dto/inquiry-response.dto';
import { InquiriesService } from './inquiries.service';

@ApiTags('inquiries')
@ApiBearerAuth()
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Controller('inquiries')
export class InquiriesController {
  constructor(
    private readonly inquiriesService: InquiriesService,
  ) {}

  @Post()
  @Roles(
    UserRole.CARE_MANAGER,
    UserRole.ADMIN,
  )
  @ApiOperation({
    summary: '問い合わせを作成する',
    description:
      'ログインユーザーとして指定した介護施設へ問い合わせを作成し、初回メッセージも同時に保存します。',
  })
  @ApiCreatedResponse({
    description: '問い合わせの作成に成功',
    type: CreateInquiryResponseDto,
  })
  @ApiBadRequestResponse({
    description: '入力値が不正',
  })
  @ApiForbiddenResponse({
    description: 'このユーザー種別では問い合わせを作成できない',
  })
  async create(
    @Body() dto: CreateInquiryDto,
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<CreateInquiryResponseDto> {
    return this.inquiriesService.create(
      dto,
      user,
    );
  }

  @Get()
  @Roles(
    UserRole.CARE_MANAGER,
    UserRole.FACILITY,
    UserRole.ADMIN,
  )
  @ApiOperation({
    summary: '問い合わせ一覧を取得する',
    description:
      'ケアマネは自分の問い合わせ、施設職員は自施設宛の問い合わせ、管理者は全問い合わせを取得します。',
  })
  @ApiOkResponse({
    description: '問い合わせ一覧の取得に成功',
    type: InquiryListResponseDto,
  })
  @ApiBadRequestResponse({
    description: '検索条件が不正',
  })
  @ApiForbiddenResponse({
    description: '問い合わせ一覧へのアクセス権がない',
  })
  async findAll(
    @Query() query: InquirySearchDto,
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<InquiryListResponseDto> {
    return this.inquiriesService.findAll(
      query,
      user,
    );
  }

  @Get(':inquiryId')
  @Roles(
    UserRole.CARE_MANAGER,
    UserRole.FACILITY,
    UserRole.ADMIN,
  )
  @ApiOperation({
    summary: '問い合わせ詳細を取得する',
    description:
      'ケアマネは自分の問い合わせ、施設職員は自施設宛の問い合わせ、管理者は全問い合わせの詳細を取得します。',
  })
  @ApiParam({
    name: 'inquiryId',
    description: '問い合わせID',
    example: '808239cf-f7e4-454d-937d-dff4daa00c74',
  })
  @ApiOkResponse({
    description: '問い合わせ詳細の取得に成功',
    type: InquiryResponseDto,
  })
  @ApiBadRequestResponse({
    description: '問い合わせIDの形式が不正',
  })
  @ApiForbiddenResponse({
    description: 'この問い合わせへのアクセス権がない',
  })
  @ApiNotFoundResponse({
    description: '指定された問い合わせが存在しない',
  })
  async findOne(
    @Param(
      'inquiryId',
      new ParseUUIDPipe(),
    )
    inquiryId: string,
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<InquiryResponseDto> {
    return this.inquiriesService.findOne(
      inquiryId,
      user,
    );
  }

  @Post(':inquiryId/messages')
  @Roles(
    UserRole.CARE_MANAGER,
    UserRole.FACILITY,
    UserRole.ADMIN,
  )
  @ApiOperation({
    summary: '問い合わせにメッセージを追加する',
    description:
      'ケアマネは自分の問い合わせ、施設職員は自施設宛の問い合わせにメッセージを追加します。',
  })
  @ApiParam({
    name: 'inquiryId',
    description: '問い合わせID',
    example: '808239cf-f7e4-454d-937d-dff4daa00c74',
  })
  @ApiCreatedResponse({
    description: 'メッセージ追加に成功',
    type: InquiryMessageResponseDto,
  })
  @ApiBadRequestResponse({
    description: '入力値または問い合わせIDが不正',
  })
  @ApiForbiddenResponse({
    description: 'この問い合わせへメッセージを追加する権限がない',
  })
  @ApiNotFoundResponse({
    description: '指定された問い合わせが存在しない',
  })
  async addMessage(
    @Param(
      'inquiryId',
      new ParseUUIDPipe(),
    )
    inquiryId: string,
    @Body() dto: CreateInquiryMessageDto,
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<InquiryMessageResponseDto> {
    return this.inquiriesService.addMessage(
      inquiryId,
      dto,
      user,
    );
  }

  @Patch(':inquiryId/status')
  @Roles(
    UserRole.CARE_MANAGER,
    UserRole.FACILITY,
    UserRole.ADMIN,
  )
  @ApiOperation({
    summary: '問い合わせステータスを更新する',
    description:
      'ケアマネは自分の問い合わせ、施設職員は自施設宛の問い合わせ、管理者は全問い合わせのステータスを更新します。',
  })
  @ApiParam({
    name: 'inquiryId',
    description: '問い合わせID',
    example: '808239cf-f7e4-454d-937d-dff4daa00c74',
  })
  @ApiOkResponse({
    description: 'ステータス更新に成功',
    type: InquiryResponseDto,
  })
  @ApiBadRequestResponse({
    description: '入力値または問い合わせIDが不正',
  })
  @ApiForbiddenResponse({
    description: 'この問い合わせのステータスを更新する権限がない',
  })
  @ApiNotFoundResponse({
    description: '指定された問い合わせが存在しない',
  })
  async updateStatus(
    @Param(
      'inquiryId',
      new ParseUUIDPipe(),
    )
    inquiryId: string,
    @Body() dto: UpdateInquiryStatusDto,
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<InquiryResponseDto> {
    return this.inquiriesService.updateStatus(
      inquiryId,
      dto,
      user,
    );
  }
}