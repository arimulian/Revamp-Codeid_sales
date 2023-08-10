/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SalesOrderHeader } from 'src/entities/SalesOrderHeader';
import { Users } from 'src/entities/Users';
import { Repository } from 'typeorm';
import { TransactionPayment } from 'src/entities/TransactionPayment';
import * as moment from 'moment';
import { OrderDto } from './dto/order.dto';
import { Status } from 'src/entities/Status';
import { SummaryOrderrDto } from './dto/summary-order.dto';
import { UsersAccount } from 'src/entities/UsersAccount';

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

  /**
   * Create an order with the given order details
   * @param orders - The order details
   * @returns The created order
   * @throws InternalServerErrorException if the account number is not registered or the saldo is not enough
   */
  async createOrder(orders: OrderDto) {
    const { user, trpaCodeNumber } = orders;
    const order = this.orderRepository;

    // Find the user with the specified user entity ID, along with their cart items and active user accounts
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

    // Find the transaction payment with the specified transaction code number
    const transactionPayment = await this.transactionRepository.findOne({
      where: {
        trpaCodeNumber: trpaCodeNumber,
      },
    });

    // Check if the user's account number is registered
    if (!userId || userId.usersAccounts.length === 0) {
      throw new InternalServerErrorException(
        'sorry, your account number is not registered',
      );
    } else {
      // Calculate the total price of the cart item
      const total = userId.cartItems[0].caitUnitPrice;

      // Get the saldo (account balance) of the user
      const saldo = userId.usersAccounts[0].usacSaldo;

      // Format the total price as a numeric value
      const totalString = total.replace('Rp', '').replace('.', '');
      const totalNumeric = parseInt(totalString);

      // Parse the saldo as a numeric value
      const saldoNumeric = parseInt(saldo);

      // Check if the saldo is not enough to cover the total price
      if (saldoNumeric < totalNumeric) {
        throw new BadRequestException('sorry, your saldo is not enough');
      } else {
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
