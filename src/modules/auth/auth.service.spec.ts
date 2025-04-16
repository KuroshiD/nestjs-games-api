import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../../database/entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let userRepository: any;
    let jwtService: any;
    let configService: any;

    beforeEach(() => {
        userRepository = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };
        jwtService = {
            signAsync: jest.fn(),
            verify: jest.fn(),
        };
        configService = {
            get: jest.fn(),
        };
        service = new AuthService(userRepository, jwtService, configService);
    });

    describe('login', () => {
        it('should throw if user not found', async () => {
            userRepository.findOne.mockResolvedValue(undefined);
            await expect(service.login({ username: 'a', password: 'b' })).rejects.toThrow(UnauthorizedException);
        });

        it('should throw if password is invalid', async () => {
            userRepository.findOne.mockResolvedValue({ id: 1, username: 'a', password: 'hashed', email: 'e' });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);
            await expect(service.login({ username: 'a', password: 'b' })).rejects.toThrow(UnauthorizedException);
        });

        it('should return user and tokens if credentials are valid', async () => {
            const user = { id: 1, username: 'a', password: 'hashed', email: 'e' };
            userRepository.findOne.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            jest.spyOn(service as any, 'generateTokens').mockResolvedValue({ access_token: 'at', refresh_token: 'rt' });

            const result = await service.login({ username: 'a', password: 'b' });
            expect(result).toEqual({
                user: { id: 1, username: 'a', email: 'e' },
                access_token: 'at',
                refresh_token: 'rt',
            });
        });
    });

    describe('register', () => {
        it('should throw if username or email exists', async () => {
            userRepository.findOne.mockResolvedValue({ id: 1 });
            await expect(service.register({ username: 'a', email: 'e', password: 'p' })).rejects.toThrow(UnauthorizedException);
        });

        it('should create, save user and return user and tokens', async () => {
            userRepository.findOne.mockResolvedValue(undefined);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
            const user = { id: 2, username: 'a', email: 'e', password: 'hashed' };
            userRepository.create.mockReturnValue(user);
            userRepository.save.mockResolvedValue(user);
            jest.spyOn(service as any, 'generateTokens').mockResolvedValue({ access_token: 'at', refresh_token: 'rt' });

            const result = await service.register({ username: 'a', email: 'e', password: 'p' });
            expect(userRepository.create).toHaveBeenCalledWith({ username: 'a', email: 'e', password: 'hashed' });
            expect(userRepository.save).toHaveBeenCalledWith(user);
            expect(result).toEqual({
                user: { id: 2, username: 'a', email: 'e' },
                access_token: 'at',
                refresh_token: 'rt',
            });
        });
    });

    describe('refreshToken', () => {
        it('should throw if jwtService.verify throws', async () => {
            jwtService.verify.mockImplementation(() => { throw new Error('fail'); });
            await expect(service.refreshToken({ refresh_token: 'rt' })).rejects.toThrow(UnauthorizedException);
        });

        it('should throw if user not found', async () => {
            jwtService.verify.mockReturnValue({ sub: 1 });
            configService.get.mockReturnValue('secret');
            userRepository.findOne.mockResolvedValue(undefined);
            await expect(service.refreshToken({ refresh_token: 'rt' })).rejects.toThrow(UnauthorizedException);
        });

        it('should return tokens if refresh is valid', async () => {
            jwtService.verify.mockReturnValue({ sub: 1 });
            configService.get.mockReturnValue('secret');
            const user = { id: 1, username: 'a', email: 'e' };
            userRepository.findOne.mockResolvedValue(user);
            jest.spyOn(service as any, 'generateTokens').mockResolvedValue({ access_token: 'at', refresh_token: 'rt' });

            const result = await service.refreshToken({ refresh_token: 'rt' });
            expect(result).toEqual({ access_token: 'at', refresh_token: 'rt' });
        });
    });

    describe('generateTokens', () => {
        it('should sign and return tokens', async () => {
            configService.get.mockImplementation((key: string) => key === 'JWT_ACCESS_SECRET' ? 'as' : 'rs');
            jwtService.signAsync
                .mockResolvedValueOnce('access')
                .mockResolvedValueOnce('refresh');
            const user = { id: '1', username: 'a', password: 'dummyPassword' } as User;
            const result = await (service as any).generateTokens(user);
            expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
            expect(result).toEqual({ access_token: 'access', refresh_token: 'refresh' });
        });
    });

    describe('validateUser', () => {
        it('should return user without password if valid', async () => {
            const user = { id: 1, username: 'a', password: 'hashed', email: 'e' };
            userRepository.findOne.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.validateUser('a', 'p');
            expect(result).toEqual({ id: 1, username: 'a', email: 'e' });
        });

        it('should return null if user not found', async () => {
            userRepository.findOne.mockResolvedValue(undefined);
            const result = await service.validateUser('a', 'p');
            expect(result).toBeNull();
        });

        it('should return null if password is invalid', async () => {
            userRepository.findOne.mockResolvedValue({ id: 1, username: 'a', password: 'hashed', email: 'e' });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);
            const result = await service.validateUser('a', 'p');
            expect(result).toBeNull();
        });
    });
});