import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameService } from './games.service';
import { Game } from '../../database/entities/game.entity';
import Redis from 'ioredis';

jest.mock('ioredis');

describe('GameService', () => {
    let service: GameService;
    let repository: Repository<Game>;
    let queryBuilder: any;

    beforeEach(async () => {
        queryBuilder = {
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(null),
            getMany: jest.fn().mockResolvedValue([]),
            getCount: jest.fn().mockResolvedValue(0),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameService,
                {
                    provide: getRepositoryToken(Game),
                    useValue: {
                        createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<GameService>(GameService);
        repository = module.get<Repository<Game>>(getRepositoryToken(Game));

        // Mock Redis methods
        (Redis as jest.MockedClass<typeof Redis>).mockImplementation(() => ({
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue('OK'),
        } as any));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });


    describe('listGames', () => {
        it('should create a basic query builder', async () => {
            await service.listGames();

            expect(repository.createQueryBuilder).toHaveBeenCalledWith('game');
            expect(queryBuilder.skip).toHaveBeenCalledWith(0);
            expect(queryBuilder.take).toHaveBeenCalledWith(10);
            expect(queryBuilder.getMany).toHaveBeenCalled();
        });

        it('should add name filter to the query when name is provided', async () => {
            const name = 'mario';

            await service.listGames(name);

            expect(queryBuilder.andWhere).toHaveBeenCalledWith(
                'LOWER(game.title) LIKE :name',
                { name: '%mario%' }
            );
        });

        it('should add platform filter to the query when platform is provided', async () => {
            const platform = 'xbox';

            await service.listGames(undefined, platform);

            expect(queryBuilder.andWhere).toHaveBeenCalledWith(
                'LOWER(game.platforms) LIKE :platform',
                { platform: '%xbox%' }
            );
        });

        it('should add both name and platform filters when both are provided', async () => {
            const name = 'mario';
            const platform = 'switch';

            await service.listGames(name, platform);

            expect(queryBuilder.andWhere).toHaveBeenCalledWith(
                'LOWER(game.title) LIKE :name',
                { name: '%mario%' }
            );
            expect(queryBuilder.andWhere).toHaveBeenCalledWith(
                'LOWER(game.platforms) LIKE :platform',
                { platform: '%switch%' }
            );
        });

        it('should apply correct pagination parameters', async () => {
            const page = 3;
            const limit = 15;

            await service.listGames(undefined, undefined, page, limit);

            expect(queryBuilder.skip).toHaveBeenCalledWith((page - 1) * limit);
            expect(queryBuilder.take).toHaveBeenCalledWith(limit);
        });

        it('should return properly formatted results', async () => {
            const mockGames = [
                { id: 1, title: 'Game 1' },
                { id: 2, title: 'Game 2' },
            ];
            const mockTotal = 20;
            const page = 2;
            const limit = 10;

            queryBuilder.getMany.mockResolvedValueOnce(mockGames);
            queryBuilder.getCount.mockResolvedValueOnce(mockTotal);

            const result = await service.listGames(undefined, undefined, page, limit);

            expect(result).toEqual({
                games: mockGames,
                total: mockTotal,
                page: page,
                limit: limit,
                totalPages: 2
            });
        });

        it('should calculate total pages correctly', async () => {
            queryBuilder.getCount.mockResolvedValueOnce(21);

            const result = await service.listGames(undefined, undefined, 1, 10);

            expect(result.totalPages).toBe(3);
        });

        it('should default to page 1 and limit 10 if not provided', async () => {
            await service.listGames();
            expect(queryBuilder.skip).toHaveBeenCalledWith(0);
            expect(queryBuilder.take).toHaveBeenCalledWith(10);
        });

        it('should handle zero games and zero total gracefully', async () => {
            queryBuilder.getMany.mockResolvedValueOnce([]);
            queryBuilder.getCount.mockResolvedValueOnce(0);

            const result = await service.listGames();
            expect(result).toEqual({
                games: [],
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0
            });
        });

        it('should handle limit greater than total games', async () => {
            const mockGames = [{ id: 1, title: 'Game 1' }];
            queryBuilder.getMany.mockResolvedValueOnce(mockGames);
            queryBuilder.getCount.mockResolvedValueOnce(1);

            const result = await service.listGames(undefined, undefined, 1, 100);
            expect(result.totalPages).toBe(1);
            expect(result.games).toEqual(mockGames);
        });

        it('should not call andWhere if name and platform are not provided', async () => {
            await service.listGames();
            expect(queryBuilder.andWhere).not.toHaveBeenCalled();
        });

        it('should handle platform filter correctly', async () => {
            const platform = 'switch';

            await service.listGames(undefined, platform);

            expect(queryBuilder.andWhere).toHaveBeenCalledWith(
                'LOWER(game.platforms) LIKE :platform',
                { platform: '%switch%' }
            );
        });

        it('should apply correct pagination parameters', async () => {
            const page = 3;
            const limit = 15;

            await service.listGames(undefined, undefined, page, limit);

            expect(queryBuilder.skip).toHaveBeenCalledWith((page - 1) * limit);
            expect(queryBuilder.take).toHaveBeenCalledWith(limit);
        });

        it('should return properly formatted results', async () => {
            const mockGames = [
                { id: 1, title: 'Game 1' },
                { id: 2, title: 'Game 2' },
            ];
            const mockTotal = 20;
            const page = 2;
            const limit = 10;

            queryBuilder.getMany.mockResolvedValueOnce(mockGames);
            queryBuilder.getCount.mockResolvedValueOnce(mockTotal);

            const result = await service.listGames(undefined, undefined, page, limit);

            expect(result).toEqual({
                games: mockGames,
                total: mockTotal,
                page: page,
                limit: limit,
                totalPages: 2
            });
        });

        it('should calculate total pages correctly', async () => {
            queryBuilder.getCount.mockResolvedValueOnce(21);

            const result = await service.listGames(undefined, undefined, 1, 10);

            expect(result.totalPages).toBe(3);
        });
    });
describe('searchGames', () => {
    let redisGetMock: jest.Mock;
    let redisSetMock: jest.Mock;
    let axiosGetMock: jest.SpyInstance;

    beforeEach(() => {
        // Get the redisClient mocks
        redisGetMock = (service as any).redisClient.get as jest.Mock;
        redisSetMock = (service as any).redisClient.set as jest.Mock;
        axiosGetMock = jest.spyOn(require('axios'), 'get');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return cached game if found in redis', async () => {
        const cachedGame = { id: 1, title: 'cached game' };
        redisGetMock.mockResolvedValueOnce(JSON.stringify(cachedGame));

        const result = await service.searchGames('Cached Game');
        expect(redisGetMock).toHaveBeenCalledWith('cached game');
        expect(result).toEqual(cachedGame);
    });

    it('should return game from database if not in cache and cache it', async () => {
        redisGetMock.mockResolvedValueOnce(null);
        const dbGame = { id: 2, title: 'db game' };
        const queryBuilder = {
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValueOnce(dbGame),
        };
        repository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder as any);

        const result = await service.searchGames('Db Game');
        expect(queryBuilder.where).toHaveBeenCalledWith('LOWER(game.title) = :title', { title: 'db game' });
        expect(queryBuilder.getOne).toHaveBeenCalled();
        expect(redisSetMock).toHaveBeenCalledWith('game:db game', JSON.stringify(dbGame), 'EX', 3600);
        expect(result).toEqual(dbGame);
    });

    it('should fetch from RAWG API, create, save and cache new game if not found in cache or db', async () => {
        redisGetMock.mockResolvedValueOnce(null);
        const queryBuilder = {
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValueOnce(null),
        };
        repository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder as any);

        const rawgGame = {
            name: 'API Game',
            description: 'desc',
            platforms: [{ platform: { name: 'PC' } }, { platform: { name: 'Switch' } }],
            released: '2020-01-01',
            rating: 4.5,
            background_image: 'img.jpg',
        };
        axiosGetMock.mockResolvedValueOnce({ data: { results: [rawgGame] } });

        const createdGame = { id: 3, title: 'API Game' };
        repository.create = jest.fn().mockReturnValue(createdGame);
        repository.save = jest.fn().mockResolvedValueOnce(createdGame);

        process.env.RAWG_API_KEY = 'testkey';

        const result = await service.searchGames('API Game');
        expect(axiosGetMock).toHaveBeenCalledWith(
            expect.stringContaining('https://api.rawg.io/api/games?search=API Game&key=testkey')
        );
        expect(repository.create).toHaveBeenCalledWith({
            title: rawgGame.name,
            description: rawgGame.description,
            platforms: 'PC, Switch',
            releaseDate: rawgGame.released,
            rating: rawgGame.rating,
            imageUrl: rawgGame.background_image,
        });
        expect(repository.save).toHaveBeenCalledWith(createdGame);
        expect(redisSetMock).toHaveBeenCalledWith('game:api game', JSON.stringify(createdGame), 'EX', 3600);
        expect(result).toEqual(createdGame);
    });

    it('should throw NotFoundException if RAWG API returns no results', async () => {
        redisGetMock.mockResolvedValueOnce(null);
        const queryBuilder = {
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValueOnce(null),
        };
        repository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder as any);

        axiosGetMock.mockResolvedValueOnce({ data: { results: [] } });

        process.env.RAWG_API_KEY = 'testkey';

        await expect(service.searchGames('Unknown Game')).rejects.toThrow('Game with title "Unknown Game" not found');
    });

    it('should trim and lowercase the title for cache and db lookup', async () => {
        redisGetMock.mockResolvedValueOnce(null);
        const dbGame = { id: 4, title: 'Trimmed Game' };
        const queryBuilder = {
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValueOnce(dbGame),
        };
        repository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder as any);

        await service.searchGames('  Trimmed Game  ');
        expect(redisGetMock).toHaveBeenCalledWith('trimmed game');
        expect(queryBuilder.where).toHaveBeenCalledWith('LOWER(game.title) = :title', { title: 'trimmed game' });
    });

    it('should propagate errors from axios', async () => {
        redisGetMock.mockResolvedValueOnce(null);
        const queryBuilder = {
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValueOnce(null),
        };
        repository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder as any);

        axiosGetMock.mockRejectedValueOnce(new Error('API error'));

        process.env.RAWG_API_KEY = 'testkey';

        await expect(service.searchGames('Any Game')).rejects.toThrow('API error');
    });
});
})