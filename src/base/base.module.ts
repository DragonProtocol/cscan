import { BaseController } from './base.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [BaseController],
})
export class BaseModule {}
