import { Module } from '@nestjs/common';
import { GameController } from './games.controller';
import { GameService } from './games.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from "@entities/game.entity"

@Module({
    imports: [ TypeOrmModule.forFeature([ Game ])],
    controllers: [GameController],
    providers: [GameService],
})
export class GameModule {}