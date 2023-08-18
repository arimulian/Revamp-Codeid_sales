import { Controller, Get, Post, Query } from '@nestjs/common';
import { FintechService } from './fintech.service';
import { FintechDto } from './dto/fintech.dto';
import { Fintech } from 'output/entities/Fintech';

@Controller('api/fintech')
export class FintechController {
  constructor(private fintechService: FintechService) {}

  @Get('accounts')
  findFintech(@Query() account: FintechDto): Promise<Fintech[]> {
    return this.fintechService.getFintech(account);
  }

  @Post('verify')
  verifyFintech(@Query() account: FintechDto): Promise<void> {
    return this.fintechService.verifyFintech(account);
  }
}
