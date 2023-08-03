/* eslint-disable prettier/prettier */
import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ProgramService } from './program.service';
import { FilterProgramDto } from './dto/filterprogram.dto';

@Controller('api/programs/search')
export class ProgramController {
  constructor(private programService: ProgramService) {}

  @Get()
  findAll(
    @Query('pageno', new DefaultValuePipe(1), ParseIntPipe) pageno: number,
    @Query('pagesize', new DefaultValuePipe(10), ParseIntPipe) pagesize: number,
    @Query() filter: FilterProgramDto,
  ) {
    return this.programService.getProgram(filter, {
      page: pageno,
      limit: pagesize,
    });
  }
}

@Controller('api/programs/view')
export class ProgramControllerView {
  constructor(private programService: ProgramService) {}
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.programService.getProgramById(id);
  }
}
