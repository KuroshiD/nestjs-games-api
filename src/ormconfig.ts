import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { Game } from './database/entities/game.entity';
import { User } from './database/entities/user.entity';

config();

const configService = new ConfigService();

const isCLI = process.env.TYPEORM_CLI === 'true';

export default new DataSource({
  type: 'postgres',
  host: isCLI ? 'localhost' : configService.get<string>('POSTGRES_HOST'), 
  port: configService.get<number>('POSTGRES_PORT'),
  username: configService.get<string>('POSTGRES_USER'),
  password: configService.get<string>('POSTGRES_PASSWORD'),
  database: configService.get<string>('POSTGRES_DB'),
  entities: [Game, User],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});