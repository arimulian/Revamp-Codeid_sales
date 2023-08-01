import { Module } from '@nestjs/common';
import { ProgramService } from './program.service';
import { ProgramController, ProgramControllerView } from './program.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecialOfferPrograms } from 'output/entities/SpecialOfferPrograms';

@Module({
  imports: [TypeOrmModule.forFeature([SpecialOfferPrograms])],
  providers: [ProgramService],
  controllers: [ProgramController, ProgramControllerView],
})
export class ProgramModule {}
