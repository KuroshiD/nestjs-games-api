import { Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Game } from "../../database/entities/game.entity"
import axios from "axios"
import Redis from "ioredis"

@Injectable()
export class GameService {
    private redisClient: Redis;

    constructor(@InjectRepository(Game) private readonly gameRepository: Repository<Game>) {
        this.redisClient = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT as string, 10) || 6379,
        });
    }

    async searchGames(title: string): Promise<Game | { message: string }> {
        const normalizedTitle = title.trim().toLowerCase();
        const cacheKey = `game:${normalizedTitle}`

        const cachedGames = await this.redisClient.get(cacheKey);

        if (cachedGames) {
            return JSON.parse(cachedGames);
        }

        const game = await this.gameRepository
            .createQueryBuilder("game")
            .where("LOWER(game.title) = :title", { title: normalizedTitle })
            .getOne();

        if (game) {
            await this.redisClient.set(`game:${normalizedTitle}`, JSON.stringify(game), "EX", 3600);
            return game;
        }

        let rawgGame: any = null;

        try {
            const apiKey = process.env.RAWG_API_KEY
            const url = `https://api.rawg.io/api/games?search=${title}&key=${apiKey}`
            const response = await axios.get(url);
            rawgGame = response.data.results[0];
        } catch (err) {
            throw new ServiceUnavailableException(`Error fetching game data from external API`);
        }


        if (!rawgGame) {
            throw new NotFoundException(`Game with title "${title}" not found`);
        }

        const newGame = this.gameRepository.create({
            title: rawgGame.name,
            description: rawgGame.description,
            platforms: rawgGame.platforms.map((platform: any) => platform.platform.name).join(", "),
            releaseDate: rawgGame.released,
            rating: rawgGame.rating,
            imageUrl: rawgGame.background_image,
        })


        await this.gameRepository.save(newGame)

        await this.redisClient.set(cacheKey, JSON.stringify(newGame), "EX", 3600);

        return newGame
    }

    async listGames(name?: string, platform?: string, page: number = 1, limit: number = 10): Promise<{ games: Game[], total: number, page: number, limit: number, totalPages: number }> {
        const query = this.gameRepository.createQueryBuilder("game");

        if (name) {
            query.andWhere('LOWER(game.title) LIKE :name', { name: `%${name.toLowerCase()}%` });
        }

        if (platform) {
            query.andWhere('LOWER(game.platforms) LIKE :platform', { platform: `%${platform.toLowerCase()}%` })
        }

        const skip = (page - 1) * limit
        const total = await query.getCount()
        query.skip(skip).take(limit)
        const games = await query.getMany()

        const totalPages = Math.ceil(total / limit)

        return {
            games,
            total,
            page,
            limit,
            totalPages
        }
    }
}