/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment';
import { OrderDto } from './dto/order.dto';
import { SummaryOrderrDto } from './dto/summary-order.dto';
import { MailService } from 'src/mail/mail.service';
import { SalesOrderHeader } from 'output/entities/SalesOrderHeader';
import { Status } from 'output/entities/Status';
import { TransactionPayment } from 'output/entities/TransactionPayment';
import { Users } from 'output/entities/Users';
import { UsersAccount } from 'output/entities/UsersAccount';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(SalesOrderHeader)
    private orderRepository: Repository<SalesOrderHeader>,
    @InjectRepository(UsersAccount)
    private readonly usersAccountRepository: Repository<UsersAccount>,
    @InjectRepository(Users)
    private userResitory: Repository<Users>,
    @InjectRepository(TransactionPayment)
    private transactionRepository: Repository<TransactionPayment>,
    @InjectRepository(Status)
    private statusRepository: Repository<Status>,
    private readonly mailer: MailService,
  ) {}

  /**
   * Generates a new order number in the format 'PO-YYYYMMDD-NNNN'.
   * The order number is incremented each time this function is called.
   * @returns The generated order number.
   */
  generateOrderNumber(): string {
    const curentTime = moment.utc().format('YYYYMMDD');
    const randomDigits = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(5, '0');
    const orderNumber = `PO-${curentTime}-${randomDigits}`;
    return orderNumber;
  }
  generateTransactionNumber(): string {
    const timestamp = moment.utc().format('YYYYMMDD');
    const randomNumber = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(5, '0');

    const transactionNumber = `TRN-${timestamp}-${randomNumber}`;
    return transactionNumber;
  }

  /**
   *
   * GENERATE ACCES TOKEN
   *
   * /*/

  async createOrder(orders: OrderDto) {
    const { user, accountNumber } = orders;
    const order = this.orderRepository;
    // Find the user with the specified user entity ID, along with their cart items and active user accounts
    const userId = await this.userResitory.findOne({
      relations: {
        cartItems: true,
        usersAccounts: true,
        usersEmails: true,
      },
      where: {
        userEntityId: user,
        usersAccounts: {
          usacStatus: 'active',
        },
      },
      select: {
        userEntityId: true,
        userName: true,
        cartItems: {
          caitId: true,
          caitUnitPrice: true,
        },
        usersAccounts: {
          usacAccountNumber: true,
          usacSaldo: true,
        },
      },
    });

    const status = await this.statusRepository.findOne({
      relations: {
        statusModule: true,
      },
      where: {
        status: 'Closed',
        statusModule: {
          moduleName: 'Sales',
        },
      },
      select: {
        status: true,
      },
    });

    // Check if the user's account number is registered
    if (!userId || userId.usersAccounts.length === 0) {
      throw new InternalServerErrorException(
        'sorry, your account number is not registered',
      );
    } else {
      const lastIndex = userId.cartItems.length - 1;
      // Calculate the total price of the cart item
      const total = userId.cartItems[lastIndex].caitUnitPrice;

      // Get the saldo (account balance) of the user
      const saldo = userId.usersAccounts[0].usacSaldo;

      // Format the total price as a numeric value
      const totalString = total
        .replace('Rp', '')
        .replace('.', '')
        .replace('.', '');
      const totalNumeric = parseInt(totalString);
      // Parse the saldo as a numeric value
      const saldoNumeric = parseInt(saldo);
      // Check if the saldo is not enough to cover the total price
      if (saldoNumeric < totalNumeric) {
        throw new BadRequestException('sorry, your saldo is not enough');
      } else {
        // Create the transaction
        const adminNumber = this.usersAccountRepository.findOne({
          relations: { usacUserEntity: true },
          where: { usacAccountNumber: accountNumber },
        });
        const temp = parseInt(
          userId.cartItems[lastIndex].caitUnitPrice.replace(/[Rp.,]/g, ''),
        );
        const credit = temp / 100;
        const transactionPayment = this.transactionRepository.create({
          trpaUserEntity: userId,
          trpaCodeNumber: this.generateTransactionNumber(),
          trpaCredit: credit.toString(),
          trpaType: 'order'.toLowerCase(),
          trpaSourceId: userId.usersAccounts[0].usacAccountNumber,
          trpaTargetId: (await adminNumber).usacAccountNumber,
        });
        if (transactionPayment) {
          const admSaldo = (await adminNumber).usacSaldo;
          const newSaldoAdm = parseInt(admSaldo) + totalNumeric;
          await this.usersAccountRepository.update(
            { usacAccountNumber: transactionPayment.trpaTargetId },
            {
              usacSaldo: newSaldoAdm.toString(),
              usacModifiedDate: new Date().toISOString(),
            },
          );
          console.log(
            await this.transactionRepository.save(transactionPayment),
          );
          // console.log((await adminNumber).usacAccountNumber);
          // console.log((await adminNumber).usacSaldo);
          // console.log({ data: transactionPayment });
        }

        // Create the order with the necessary details
        const createOrder = order.create({
          soheUserEntity: userId,
          soheOrderDate: new Date().toISOString(),
          soheOrderNumber: this.generateOrderNumber(),
          soheTrpaCodeNumber: transactionPayment.trpaCodeNumber,
          soheSubtotal: total,
          soheAccountNumber: userId.usersAccounts[0].usacAccountNumber,
          soheStatus: status,
        });
        // Update the saldo of the user's account
        if (createOrder) {
          const newSaldo = saldoNumeric - totalNumeric;
          await this.usersAccountRepository.update(
            { usacAccountNumber: userId.usersAccounts[0].usacAccountNumber },
            {
              usacSaldo: newSaldo.toString(),
              usacModifiedDate: new Date().toISOString(),
            },
          );
          // const userEmail = userId.usersEmails[0].pmailAddress;
          // await this.mailer.sendMail(userEmail);
        }
        // return createOrder;
        return await this.orderRepository.save(createOrder);
      }
    }
  }

  async cancelOrder(data: OrderDto) {
    const { user, statusModule } = data;
    const order = this.orderRepository;
    const status = await this.statusRepository.findOne({
      relations: {
        statusModule: true,
      },
      where: {
        statusModule: {
          moduleName: 'Sales',
        },
        status: statusModule,
      },
      select: {
        status: true,
        statusModule: {
          moduleName: true,
        },
      },
    });
    const userId = await this.userResitory.findOne({
      relations: {
        cartItems: true,
        usersAccounts: true,
      },
      where: {
        userEntityId: user,
        usersAccounts: {
          usacStatus: 'active',
        },
      },
      select: {
        userEntityId: true,
        userName: true,
        cartItems: {
          caitUnitPrice: true,
        },
        usersAccounts: {
          usacAccountNumber: true,
        },
      },
    });

    if (!userId || userId.usersAccounts.length === 0) {
      throw new InternalServerErrorException(
        'sorry, your account number is not registered',
      );
    } else {
      const cancelOrder = order.create({
        soheUserEntity: userId,
        soheOrderDate: new Date().toISOString(),
        soheOrderNumber: this.generateOrderNumber(),
        soheSubtotal: userId.cartItems[0].caitUnitPrice,
        soheStatus: status,
      });
      // return cancelOrder;
      return await this.orderRepository.save(cancelOrder);
    }
  }

  async findOrder(data: SummaryOrderrDto) {
    const { orderNumber } = data;
    const summaryOrder = await this.orderRepository.findOne({
      relations: {
        soheStatus: true,
        soheUserEntity: { usersAccounts: true },
      },
      where: {
        soheOrderNumber: orderNumber,
      },
      select: {
        soheId: true,
        soheAccountNumber: true,
        soheSubtotal: true,
        soheTrpaCodeNumber: true,
        soheUserEntity: {
          userName: true,
        },
      },
    });

    if (summaryOrder.soheStatus.status.toLowerCase() === 'cancelled') {
      throw new InternalServerErrorException(
        'sorry, your order has been cancelled',
      );
    } else {
      return {
        data: {
          AccountNumber: summaryOrder.soheAccountNumber,
          AccountName: summaryOrder.soheUserEntity.userName,
          Credit: summaryOrder.soheSubtotal,
          TransactionNumber: summaryOrder.soheTrpaCodeNumber,
        },
      };
    }
  }
}
