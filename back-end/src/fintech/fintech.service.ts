/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FintechDto } from './dto/fintech.dto';
import { UsersAccount } from 'output/entities/UsersAccount';
import { Fintech } from 'output/entities/Fintech';

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
  async verifyFintech(acc: FintechDto): Promise<any> {
    const { accountNumber } = acc;
    const account = await this.usersAccountRepository.findOne({
      where: { usacAccountNumber: accountNumber },
      relations: { usacUserEntity: true },
      select: {
        usacUserEntity: { userName: true, userEntityId: true },
      },
    });
    if (!account) {
      throw new BadRequestException(
        'account number: ' + accountNumber + ' is not valid',
      );
    } else if (account.usacStatus.toLowerCase() === 'inactive') {
      throw new BadRequestException(
        'account number: ' + accountNumber + ' is inactive',
      );
    } else if (account.usacStatus.toLowerCase() === 'blocked') {
      throw new BadRequestException(
        'account number: ' + accountNumber + ' is blocked',
      );
    }
    return {
      message: 'account number: ' + account.usacAccountNumber + ' is valid',
    };
  }

  /**
   * Retrieves all fintech data from the repository.
   * @returns {Promise<Fintech[]>} - A promise that resolves to an array of Fintech objects.
   * @throws {InternalServerErrorException} - If there was an error retrieving the data.
   */
  async getFintech(data: FintechDto): Promise<any> {
    const { accountNumber } = data;
    try {
      const account = await this.usersAccountRepository.findOne({
        where: { usacAccountNumber: accountNumber },
        relations: { usacUserEntity: { cartItems: true } },
        select: {
          usacUserEntity: {
            userName: true,
            userEntityId: true,
            cartItems: {
              caitUnitPrice: true,
              caitQuantity: true,
              caitId: true,
            },
          },
        },
      });

      const lastIndex = account.usacUserEntity.cartItems.length - 1;
      return {
        data: {
          accountNumber: account.usacAccountNumber,
          credit: account.usacUserEntity.cartItems[lastIndex].caitUnitPrice,
          accountName: account.usacUserEntity,
        },
      };
    } catch (e) {
      throw new NotFoundException('cart not found');
    }
  }
}
