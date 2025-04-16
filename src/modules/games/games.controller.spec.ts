import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './games.controller';
import { GameService } from './games.service';
import { ListGamesDto } from './dtos/list-games.dto';
import { Game } from '../../database/entities/game.entity';

describe('GameController', () => {
    let controller: GameController;
    let service: GameService;

    beforeEach(async () => {
        const mockGameService = {
            searchGames: jest.fn(),
            listGames: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameController],
            providers: [
                {
                    provide: GameService,
                    useValue: mockGameService,
                },
            ],
        }).compile();

        controller = module.get<GameController>(GameController);
        service = module.get<GameService>(GameService);
    });

    describe('ListGames', () => {
        it('should call service.listGames with correct parameters', async () => {
            // Arrange
            const dto: ListGamesDto = {
                name: 'Zelda',
                platform: 'Switch',
                page: 2,
                limit: 15
            };
            
            const expectedResponse = {
                games: [] as Game[],
                total: 0,
                page: 2,
                limit: 15,
                totalPages: 0
            };
            
            jest.spyOn(service, 'listGames').mockResolvedValue(expectedResponse);

            // Act
            const result = await controller.ListGames(dto);

            // Assert
            expect(service.listGames).toHaveBeenCalledWith('Zelda', 'Switch', 2, 15);
            expect(result).toBe(expectedResponse);
        });

        it('should pass undefined values correctly when dto fields are missing', async () => {
            // Arrange
            const dto: ListGamesDto = {
                name: 'Mario'
                // platform, page and limit are undefined
            };
            
            const expectedResponse = {
                games: [] as Game[],
                total: 0,
                page: 1, // Default values from service
                limit: 10, // Default values from service
                totalPages: 0
            };
            
            jest.spyOn(service, 'listGames').mockResolvedValue(expectedResponse);

            // Act
            const result = await controller.ListGames(dto);

            // Assert
            expect(service.listGames).toHaveBeenCalledWith('Mario', undefined, undefined, undefined);
            expect(result).toBe(expectedResponse);
        });

        it('should handle pagination parameters correctly', async () => {
            // Arrange
            const dto: ListGamesDto = {
                page: 5,
                limit: 20
            };
            
            const expectedResponse = {
                games: [] as Game[],
                total: 0,
                page: 5,
                limit: 20,
                totalPages: 0
            };
            
            jest.spyOn(service, 'listGames').mockResolvedValue(expectedResponse);

            // Act
            const result = await controller.ListGames(dto);

            // Assert
            expect(service.listGames).toHaveBeenCalledWith(undefined, undefined, 5, 20);
            expect(result).toBe(expectedResponse);
        });

        it('should handle empty dto correctly', async () => {
            // Arrange
            const dto = {} as ListGamesDto;
            
            const expectedResponse = {
                games: [] as Game[],
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0
            };
            
            jest.spyOn(service, 'listGames').mockResolvedValue(expectedResponse);

            // Act
            const result = await controller.ListGames(dto);

            // Assert
            expect(service.listGames).toHaveBeenCalledWith(undefined, undefined, undefined, undefined);
            expect(result).toBe(expectedResponse);
        });

        it('should handle service response with games correctly', async () => {
            // Arrange
            const dto: ListGamesDto = { name: 'Mario' };
            
            const mockGames = [
                { id: '1', title: 'Super Mario Odyssey', platforms: ['Switch'] },
                { id: '2', title: 'Super Mario Galaxy', platforms: ['Wii'] }
            ] as Game[];
            
            const expectedResponse = {
                games: mockGames,
                total: 2,
                page: 1,
                limit: 10,
                totalPages: 1
            };
            
            jest.spyOn(service, 'listGames').mockResolvedValue(expectedResponse);

            // Act
            const result = await controller.ListGames(dto);

            // Assert
            expect(service.listGames).toHaveBeenCalledWith('Mario', undefined, undefined, undefined);
            expect(result).toEqual(expectedResponse);
            expect(result.games).toHaveLength(2);
            expect(result.games[0].title).toBe('Super Mario Odyssey');
        });

        it('should propagate errors thrown by service.listGames', async () => {
            // Arrange
            const dto: ListGamesDto = { name: 'Crash' };
            const error = new Error('Database error');
            jest.spyOn(service, 'listGames').mockRejectedValue(error);

            // Act & Assert
            await expect(controller.ListGames(dto)).rejects.toThrow('Database error');
            expect(service.listGames).toHaveBeenCalledWith('Crash', undefined, undefined, undefined);
        });

        it('should call service.listGames with all undefined when dto is missing all fields', async () => {
            // Arrange
            const dto = {} as ListGamesDto;
            const expectedResponse = {
                games: [],
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0
            };
            jest.spyOn(service, 'listGames').mockResolvedValue(expectedResponse);

            // Act
            const result = await controller.ListGames(dto);

            // Assert
            expect(service.listGames).toHaveBeenCalledWith(undefined, undefined, undefined, undefined);
            expect(result).toEqual(expectedResponse);
        });
    });

    describe('searchGames', () => {
        it('should call service.searchGames with correct title and return its result', async () => {
            // Arrange
            const dto = { title: 'Halo' };
            const expectedResponse = { id: '1', title: 'Halo', platforms: ['Xbox'] };
            jest.spyOn(service, 'searchGames').mockResolvedValue(expectedResponse as Game);

            // Act
            const result = await controller.searchGames(dto);

            // Assert
            expect(service.searchGames).toHaveBeenCalledWith('Halo');
            expect(result).toBe(expectedResponse);
        });

        it('should propagate errors thrown by service.searchGames', async () => {
            // Arrange
            const dto = { title: 'ErrorGame' };
            const error = new Error('Service error');
            jest.spyOn(service, 'searchGames').mockRejectedValue(error);

            // Act & Assert
            await expect(controller.searchGames(dto)).rejects.toThrow('Service error');
            expect(service.searchGames).toHaveBeenCalledWith('ErrorGame');
        });

        it('should trim and lowercase the title before passing to service.searchGames', async () => {
            // Arrange
            const dto = { title: '   HALO  ' };
            const expectedResponse = { id: '1', title: 'Halo', platforms: ['Xbox'] };
            jest.spyOn(service, 'searchGames').mockResolvedValue(expectedResponse as Game);

            // Act
            const result = await controller.searchGames(dto);

            // Assert
            expect(service.searchGames).toHaveBeenCalledWith('   HALO  ');
            expect(result).toBe(expectedResponse);
        });
    });    

    it('should propagate errors thrown by service.searchGames', async () => {
        // Arrange
        const dto = { title: 'ErrorGame' };
        const error = new Error('Service error');
        jest.spyOn(service, 'searchGames').mockRejectedValue(error);

        // Act & Assert
        await expect(controller.searchGames(dto)).rejects.toThrow('Service error');
        expect(service.searchGames).toHaveBeenCalledWith('ErrorGame');
    });
});
