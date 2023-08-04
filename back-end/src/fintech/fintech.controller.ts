import { Controller, Get, Post, Query } from '@nestjs/common';
import { FintechService } from './fintech.service';
import { Fintech } from 'src/entities/Fintech';
import { verifyFintechDto } from './dto/verify-fintech.dto';

@Controller('api/fintech')
export class FintechController {
  constructor(private fintechService: FintechService) {}

  @Get()
  findFintech(): Promise<Fintech[]> {
    return this.fintechService.getFintech();
  }

  @Post('verify')
  verifyFintech(@Query() account: verifyFintechDto): Promise<void> {
    return this.fintechService.verifyFintech(account);
  }
}
