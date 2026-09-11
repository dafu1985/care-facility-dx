import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CareManagerOffice } from './entities/care-manager-office.entity';

/**
 * 居宅介護支援事業所管理Module。
 *
 * 現時点ではCareManagerOffice EntityのRepository登録のみ行う。
 * Controller / Serviceは必要になった段階で追加する。
 */
@Module({
  imports: [TypeOrmModule.forFeature([CareManagerOffice])],
  exports: [TypeOrmModule],
})
export class CareManagerOfficesModule {}
