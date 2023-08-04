/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Fintech } from 'src/entities/Fintech';
import { UsersAccount } from 'src/entities/UsersAccount';
import { Repository } from 'typeorm';
import { verifyFintechDto } from './dto/verify-fintech.dto';

@Injectable()
export class FintechService {
  constructor(
    @InjectRepository(UsersAccount)
    private readonly usersAccountRepository: Repository<UsersAccount>,
    @InjectRepository(Fintech)
    private readonly fintechRepository: Repository<Fintech>,
  ) {}

  /**
   * Verifies the fintech account.
   * @param acc - The account details.
   * @returns A promise that resolves to the account information if it is valid.
   * @throws InternalServerErrorException if the account is not valid, inactive, or blocked.
   */
  async verifyFintech(acc: verifyFintechDto): Promise<any> {
    const { accountNumber } = acc;
    const account = await this.usersAccountRepository.findOne({
      where: { usacAccountNumber: accountNumber },
      relations: { usacUserEntity: true },
      select: {
        usacUserEntity: { userName: true, userEntityId: true },
      },
    });
    if (!account) {
      throw new InternalServerErrorException(
        'account number: ' + accountNumber + ' is not valid',
      );
    } else if (account.usacStatus === 'inactive') {
      throw new InternalServerErrorException(
        'account number: ' + accountNumber + ' is inactive',
      );
    } else if (account.usacStatus === 'blocked') {
      throw new InternalServerErrorException(
        'account number: ' + accountNumber + ' is blocked',
      );
    }
    return {
      message: 'account number: ' + account.usacAccountNumber + ' is valid',
      data: {
        accountNumber: account.usacAccountNumber,
        accountName: account.usacUserEntity,
        credit: account.usacSaldo,
      },
    };
  }

  /**
   * Retrieves all fintech data from the repository.
   * @returns {Promise<Fintech[]>} - A promise that resolves to an array of Fintech objects.
   * @throws {InternalServerErrorException} - If there was an error retrieving the data.
   */
  async getFintech(): Promise<Fintech[]> {
    try {
      const data = await this.fintechRepository.find();
      return data;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
