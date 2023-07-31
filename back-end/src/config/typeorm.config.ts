/* eslint-disable prettier/prettier */
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'Manurung081020*',
  database: 'revamp_db',
  entities: ['dist/entities/*{ts,js}'],
  synchronize: false,
};
