import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Inquiry } from '../inquiries/entities/inquiry.entity';

import { CareManagersController } from './care-managers.controller';
import { CareManagersService } from './care-managers.service';
import { CareManager } from './entities/care-manager.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CareManager, Inquiry])],

  controllers: [CareManagersController],

  providers: [CareManagersService],

  exports: [TypeOrmModule, CareManagersService],
})
export class CareManagersModule {}
