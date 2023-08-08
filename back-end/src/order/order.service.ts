/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SalesOrderHeader } from 'src/entities/SalesOrderHeader';
import { Users } from 'src/entities/Users';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { TransactionPayment } from 'src/entities/TransactionPayment';
import * as moment from 'moment';

@Injectable()
export class OrderService {
  private lastOrderNumber = 0;
  constructor(
    @InjectRepository(SalesOrderHeader)
    private orderRepository: Repository<SalesOrderHeader>,
    @InjectRepository(Users)
    private userResitory: Repository<Users>,
    @InjectRepository(TransactionPayment)
    private transactionRepository: Repository<TransactionPayment>,
  ) {}

  /**
   * Generates a new order number in the format 'PO-YYYYMMDD-NNNN'.
   * The order number is incremented each time this function is called.
   * @returns The generated order number.
   */
  generateOrderNumber(): string {
    this.lastOrderNumber += 1;
    const curentTime = moment.utc().format('YYYYMMDD');
    const formatNumber = this.lastOrderNumber.toString().padStart(4, '0');
    const orderNumber = `PO-${curentTime}-${formatNumber}`;
    return orderNumber;
  }

  /**
   * Creates an order based on the provided order data.
   *
   * @param orders - The order data containing user and transaction details.
   * @returns The created order.
   * @throws InternalServerErrorException if the user's saldo is not enough.
   */
  async createOrder(orders: CreateOrderDto) {
    const { user, trpaCodeNumber } = orders;

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

    // Find the transaction payment with the specified transaction code number
    const transactionPayment = await this.transactionRepository.findOne({
      where: {
        trpaCodeNumber: trpaCodeNumber,
      },
    });

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
      throw new InternalServerErrorException('sorry, your saldo is not enough');
    } else {
      // Create the order with the necessary details
      const order = this.orderRepository.create({
        soheUserEntity: userId,
        soheOrderDate: new Date().toISOString(),
        soheOrderNumber: this.generateOrderNumber(),
        soheTrpaCodeNumber: transactionPayment.trpaCodeNumber,
        soheSubtotal: total,
        soheAccountNumber: userId.usersAccounts[0].usacAccountNumber,
      });

      console.log(order);
      return order;
      //     this.orderRepository.save(order);
    }
  }
}
