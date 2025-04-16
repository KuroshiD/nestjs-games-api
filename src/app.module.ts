import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigFactory } from '@config/database.config';

import { GameModule } from '@modules/games/games.module';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
    imports: [
      ConfigModule.forRoot({
        envFilePath: `.env`,
        isGlobal: true,
      }),
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule], 
        inject: [ConfigService], 
        useFactory: typeOrmConfigFactory, 
      }),
      GameModule,
      AuthModule
    ],
  })

export class AppModule { }