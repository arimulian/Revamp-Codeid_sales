/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SpecialOfferPrograms } from 'output/entities/SpecialOfferPrograms';
import { Repository } from 'typeorm';
import { FilterProgramDto } from './dto/filterprogram.dto';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class ProgramService {
  constructor(
    @InjectRepository(SpecialOfferPrograms)
    private readonly progRepository: Repository<SpecialOfferPrograms>,
  ) {}

  async getProgram(
    filterProgram: FilterProgramDto,
    option: IPaginationOptions,
  ): Promise<Pagination<SpecialOfferPrograms>> {
    const { name } = filterProgram;
    const query = this.progRepository
      .createQueryBuilder('specialOfferPrograms')
      .innerJoinAndSelect('specialOfferPrograms.socoProgEntity', 'program');
    if (name) {
      query.where('lower(program.prog_title) LIKE :prog_title', {
        prog_title: `%${name.toLowerCase()}%`,
      });
    }
    return paginate(query, option);
  }

  async getProgramById(id: number) {
    try {
      const query = await this.progRepository.findOne({
        relations: { socoProgEntity: true },
        where: { socoProgEntityId: id },
      });
      return query;
    } catch (error) {}
  }
}
