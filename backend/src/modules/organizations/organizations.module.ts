import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Organization } from './entities/organization.entity';

/**
 * 法人管理Module。
 *
 * 現時点ではOrganization EntityのRepository登録のみ行う。
 * Controller / Serviceは必要になった段階で追加する。
 */
@Module({
  imports: [TypeOrmModule.forFeature([Organization])],
  exports: [TypeOrmModule],
})
export class OrganizationsModule {}
