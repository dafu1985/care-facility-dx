import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CareManager } from './entities/care-manager.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CareManager]),
  ],
  exports: [
    TypeOrmModule,
  ],
})
export class CareManagersModule {}