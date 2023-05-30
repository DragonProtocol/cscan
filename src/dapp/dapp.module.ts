import { TypeOrmModule } from '@nestjs/typeorm';
import DappService from './dapp.service';
import { DappController } from './dapp.controller';
import { Dapp } from 'src/entities/dapp/dapp.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([Dapp], 'testnet')],
  controllers: [DappController],
  providers: [DappService],
  exports: [DappService],
})
export class DappModule {}
