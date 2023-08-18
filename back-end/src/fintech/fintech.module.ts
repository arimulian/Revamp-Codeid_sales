import { Module } from '@nestjs/common';
import { FintechService } from './fintech.service';
import { FintechController } from './fintech.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fintech } from 'output/entities/Fintech';
import { UsersAccount } from 'output/entities/UsersAccount';

@Module({
  imports: [TypeOrmModule.forFeature([Fintech, UsersAccount])],
  providers: [FintechService],
  controllers: [FintechController],
})
export class FintechModule {}
